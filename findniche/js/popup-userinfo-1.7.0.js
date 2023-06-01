function callZbaseUserCenterPopupOpen(tag = 'home') {
    var userCenterPupup = $('#showUserInfoByPopup').length;
    if(userCenterPupup !== 0){
        return;
    }
    callZbasePopupGrayMask();
    var is_hide = 0;
    var grayScreen = "<div id='grayMask' style='display:none; position:fixed;width:100%;height:100%;top:0;left:0;right: 0;bottom: 0; background:rgba(0,0,0,0.3);z-index:9998;'></div>";

    var newPopupDiv = document.createElement("div");
    $(newPopupDiv).attr({
        id: 'showUserInfoByPopup',
        style: "display:none;",
        class: "popup-border-sign-user-info",
    });
    $('body').append(grayScreen);
    $('body').append(newPopupDiv);


    var iframeDom = '<div class="close-button-user-info" onclick="closeZbaseUserCenterPopupClick()"><span class="close-button-icon-user-info"></span></div>';
    var iframe = document.createElement("iframe");
    iframe.src = "/user/user-info?tag=" + tag;
    $(iframe).attr({
        id: "userinfoPopupIframe",
        style: "border-radius: 4px;",
        height: "100%",
        width: "100%",
        sandbox: "allow-scripts allow-same-origin allow-popups allow-top-navigation",
        allowtransparency: "true",
        frameborder: "0",
    });
    if (iframe.attachEvent){
        iframe.attachEvent("onload", function(){
        // $('#loadingIframe').hide();
        });
    } else {
        iframe.onload = function(){
            $('#loadingIframe').hide();
            $('#showUserInfoByPopup').css('display', '');
            $('#grayMask').css('display', '');
        };
    }
    $("#showUserInfoByPopup").append(iframeDom);
    $("#showUserInfoByPopup").append(iframe);
}
function closeZbaseUserCenterPopupClick() {
    var userPupup = document.getElementById('showUserInfoByPopup');
    var grayMask = document.getElementById('grayMask');
    document.body.removeChild(userPupup); 
    document.body.removeChild(grayMask); 
}
function callZbasePopupGrayMask() {
    var load = $('#loadingIframe').length;
    if(load == 0){
        var loadingDiv = document.createElement('div');
        $(loadingDiv).attr({id: "loadingIframe",style: "position:fixed;top:0;bottom:0;right:0;left:0;z-index:10000;background:rgba(0,0,0,0.3);"});
        var loadGif = "<img src='https://zbase-global.zingfront.com/static/imgs/loading.gif' style='position:fixed;height:128px;width:128px;left:50%;top:50%;margin-left:-64px;margin-top:-64px;z-index:10000;'>"
        $(loadingDiv).append(loadGif);
        document.body.appendChild(loadingDiv);
    }
    $('#loadingIframe').show();
}