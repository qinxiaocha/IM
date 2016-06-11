/**
 * Created by win on 2015/6/25.
 */
var websocket = null;
var userId, userName;
var targetUserIds =[];
var onlinecount = 'ONLINECOUNT' , onlinelist = 'ONLINELIST' , onlinenotice = 'ONLINENOTICE',txt = 'TXT';

function connection(websocketUrl, sockJSUrl) {
    if (!websocketUrl || !sockJSUrl) {
        console.log("链接地址不能为空");
    }
    if ('WebSocket' in window) {
        websocket = new WebSocket("ws://" + websocketUrl);
    } else if ('MozWebSocket' in window) {
        websocket = new MozWebSocket("ws://" + websocketUrl);
    } else {
        websocket = new SockJS("ws://" + sockJSUrl);
    }
    websocket.onopen = function (evnt) {
        console.log("链接服务器成功");
    };
    websocket.onmessage = function (evnt) {
        console.log(evnt);
        var data = evnt.data;
        
        data = jQuery.parseJSON(data);
        if(data.msgContentType == onlinecount){
            $('.im-head-mun').html(data.msgContent);
            if(data.msgContent == 0){
                $('.noagent').show();
            }else{
                $('.noagent').hide();
            }
        }
        if(data.msgContentType == onlinelist){
            $('.im-listitem-container').empty();

            $.each(data.msgContent,function(index, element){
                var nickname = (element.nickname == userName ? element.nickname + '(我)' : element.nickname);
                var objLits = '<li class="list-item">' +  
                                  '<img class="img-item" src="img/1.jpg"' + 
                                  // element.icons + 
                                  'width = "40" height = "40"/>' + 
                                  '<span>' +
                                  nickname +
                                  '</span>'+
                                  '<input type="hidden" id="' +element.userId+  '" value="'+element.userId+'"/>'
                              '</li>';
                $('.im-listitem-container').append(objLits);
            })

            //双击对某人聊天
            $(".im-listitem-container > li").dblclick(function() {
                var name = $(this).find('span').text();
                if(name != userName + '(我)'){
                    $('.im-wt-name').html(name);
                    $('.im-window').show();
                    var targetid =  $(this).find('input').attr('id');
                    targetUserIds.push(targetid);
                }
            });
        }

        if(data.msgContentType == onlinenotice){
            var msgContent = data.msgContent.split(":");
            userId = msgContent[0];
            userName = msgContent[1];
        }

        if(data.msgContentType == txt){
            if(data.nickname == userName){
            }else{ 
                $('.im-wt-name').html(data.userName);
                $('.im-window').show();
                var objLits = ' <li class="chat-block chat-in">' +
                                '<div class="chat-avatar">' + 
                                    '<a title>' +
                                        '<img src alt width="34" height="34">' +
                                    '</a>' +
                                '</div>' +
                                '<div class="chat-content">' +
                                    '<i>▼</i>' +
                                    '<p>' + data.msgContent +
                                    '</p>' +
                                '</div>' +
                              '</li>';
                $("#im-window-msgcontainer").append(objLits);
            }  
        }

    };
    websocket.onerror = function (evnt) {
        console.log("出现了一个错误");
    };
    websocket.onclose = function (evnt) {
        console.log("链接服务器失败");
    }
   
}

function send(msgContent) {
    if (websocket) {
        var msgClient = {
            "sendUserId":userId,
            "sendUserName":userName,
            "msgContentType":'TXT',
            "msgType":"P2P",
            "msgContent":msgContent,
            "targetUserIds":targetUserIds
            // "time":time
        };
        websocket.send(JSON.stringify(msgClient));
        var objLits = ' <li class="chat-block chat-out">' +
                            '<div class="chat-avatar">' + 
                                '<a title>' +
                                    '<img src alt width="34" height="34">' +
                                '</a>' +
                            '</div>' +
                            '<div class="chat-content">' +
                                '<i>▼</i>' +
                                '<p>' + msgContent +
                                '</p>' +
                            '</div>' +
                      '</li>';
        $("#im-window-msgcontainer").append(objLits);
        document.getElementById('im-window-msgcontainer').scrollTop = document.getElementById('im-window-msgcontainer').scrollHeight;
    } else {
        $("#msg").html($("#msg").html()  + "发送失败");
    }
}

