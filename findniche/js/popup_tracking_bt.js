/***************************************************************************
 * Copyright (c) 2019  The AppsMoto Authors 
 * ZingFront.com, Inc. All Rights Reserved 
 **************************************************************************/
 
/**
 * @file web/js/track.js
 * @author liutt[e@zxianstudio.com]
 * @date 2019/09/26 15:29:30
 * @brief 
 **/
var u = getQueryVariable("u");
window.trackLayer=window.trackLayer || [];trackLayer = {
    trackingCode: u ? u : '',
    userId:''
};
(function(w,d,s,l){
    var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='trackLayer'?'&l='+l:'';
    j.async=true;
    j.src='https://zbase-global.zingfront.com/static/js/popup_tracking.js?v='+ new Date().getTime();
    f.parentNode.insertBefore(j,f)
})(window,document,'script','trackLayer');
function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
    } 
    return(false);
}
var t = window.trackLayer;
(function(a, w){
    upsetCookie();
    var regPages = ['/user/login', '/user/default/login', '/user/register', '/user/default/register'];
    var confirmPages = ['/user/confirm-email'];
    var currentPage = w.location.pathname;
    pageView();
    if(regPages.indexOf(currentPage) > -1) {
        // console.info('注册页面');
        regEvent();
    }
    // if(confirmPages.indexOf(currentPage) > -1){
    //     console.log('注册确认页面');
    //     confirmEvent();
    // }
    //访问分享页面事件
    function pageView() {
        // console.info('访问页面事件');
        var userId = getCookie('_trackUserId');
        var refcode = getCookie('_trackCode');

        var refcode = refcode ? refcode : '';
        //console.info(refcode);
        if (refcode == '') {
            return false;
        }
        var device = browserRedirect();
        var userId = userId ? userId : 0;
        var e = 'ref_visit';
        var url = '/user/popup/reg-event?refcode=' + refcode + '&userId=' + userId + "&device=" + device + "&e=" + e;
        $.get(url, function(result){
            //console.info(result);
        });

    }
    //访问注册页面事件
    function regEvent() {
        //console.info('发送注册页面访问事件');
        var userId = getCookie('_trackUserId');
        var refcode = getCookie('_trackCode');

        var refcode = refcode ? refcode : '';
        //console.info(refcode);
        if (refcode == '') {
            return false;
        }
        var device = browserRedirect();
        var userId = userId ? userId : 0;
        var e = 'ref_reg';
        var url = '/user/popup/reg-event?refcode=' + refcode + '&userId=' + userId + "&device=" + device + "&e=" + e;
        $.get(url, function(result){
            //console.info(result);
        });
    }

    //访问注册成功激活页面
    function confirmEvent(){
        //console.log('发送注册后点击获取连接的访问事件');
        var userId = getCookie('_trackUserId');
        var refcode = getCookie('_trackCode');

        var refcode = refcode ? refcode : '';
        //console.info(refcode);
        if (refcode == '') {
            return false;
        }
        var device = browserRedirect();
        var userId = userId ? userId : 0;
        var e = 'ref_success';
        var url = '/user/popup/reg-event?refcode=' + refcode + '&userId=' + userId + "&device=" + device + "&e=" + e;
        $.get(url, function(result){
            //console.info(result);
            if(result){//注册记录成功的情况下销毁cookie中的_trackUserId和_trackCode两个key值
                setCookie('_trackUserId', '');
                setCookie('_trackCode', '');
            }
        });
    }
    function upsetCookie () {
        var trackLayer = this.trackLayer;
        var trackingCode = '';
        var userId = getCookie('_trackUserId');
        var refcode = getCookie('_trackCode');
        if (userId == '') {
            userId = (trackLayer.userId == '') ? 'G-'+Date.parse(new Date()) : trackLayer.userId;
            setCookie('_trackUserId', userId);
        } else {
            if (trackLayer.userId != '' && trackLayer.userId != userId) {
                userId = trackLayer.userId;
                setCookie('_trackUserId', userId);
            }
        }
        if (refcode == '') {
            if (trackLayer.trackingCode != '') {
                refcode = trackLayer.trackingCode;
                setCookie('_trackCode', trackLayer.trackingCode);
            }
        } else {
            if (trackLayer.trackingCode != '' && trackLayer.trackingCode != refcode) {
                refcode = trackLayer.trackingCode;
                setCookie('_trackCode', refcode);
            }
        }
        //console.info(userId,refcode);
    }
    //写cookies
    function setCookie(name,value)
    {
        var Days = 30;
        var exp = new Date();
        exp.setTime(exp.getTime() + Days*24*60*60*1000);
        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString() + ";path=/;";
        w['cookie'+name] = value;
    }
    //读取cookies
    function getCookie(name) {
        var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
        if(arr=document.cookie.match(reg))
            return unescape(arr[2]);
        else
            return '';
    }
    function browserRedirect() {
        var sUserAgent = navigator.userAgent.toLowerCase();
        var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
        var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
        var bIsMidp = sUserAgent.match(/midp/i) == "midp";
        var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
        var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
        var bIsAndroid = sUserAgent.match(/android/i) == "android";
        var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
        var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
        if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
            return "phone";
        } else {
            return "pc";
        }
    }
})(t, window);

/* vim: set ts=4 sw=4 sts=4 tw=100 */
