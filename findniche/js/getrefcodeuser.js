/**
 * get ga cid
 */
function getGACid(){
    var ga_client_id = '';
    try {
        if (typeof(ga) != "undefined") {
            if (ga.getAll) {
                //get ga_cid
                ga.getAll().forEach((tracker) => {
                    ga_client_id = tracker.get('clientId');
                });
            }
        }
    }
    catch(err){
        return '';
    }
    return ga_client_id;
}

/**
 *ga调用为state参数赋值的函数
 */
function gaCallback(ga_client_id) {
    if (ga_client_id) {
        if($("#user-ga_cid").length > 0){
            $("#user-ga_cid")[0].value = ga_client_id;
        }
        $('.third_login_a').each(function(){
            var href = $(this).attr('href');
            var arrUrlData = href.split('?');
            var operateHref = operationUrlParams(arrUrlData,'ga',ga_client_id);
            $(this).attr('href',operateHref);
        });
    }
}

/**
 *为第三方登录连接添加额外参数值
 */
function addParams(){
    $('.third_login_a').each(function(){
        var href = $(this).attr('href');
        var arrUrlData = href.split('?');
        var operateHref = operationUrlParams(arrUrlData,'uv');
        $(this).attr('href',operateHref);
    })
}
/**
 *参数处理公用函数，作用是获取第三方登录的href，根据其中state的值来处理附加参数的添加
 */
function operationUrlParams(arrUrlData,flag,ga=''){
    if(flag == 'uv'){
        var trackCode = "_trackCode";
        var arr,reg=new RegExp("(^| )"+trackCode+"=([^;]*)(;|$)");
        var device = browserRedirect();
        if(arr=document.cookie.match(reg)){
            var data = {refcode:unescape(arr[2]),device:device};
        }
    }
    if(flag == 'ga'){
        var data = {ga_cid:ga};
    }
    if(arrUrlData.length == 1){//不带任何参数
        var state = encodeData(data);
        return arrUrlData[0] + '?state=' + state;
    }else{//带有参数
        var params = arrUrlData[1].split('&');
        for (i=0;i<params.length;i++){
            var temp = params[i].split('=');
            if(temp[0] == 'state'){
                var statevalue = decodeData(temp[1]);
                if(statevalue.hasOwnProperty('refcode') && statevalue.hasOwnProperty('device') && !statevalue.hasOwnProperty('ga_cid')){
                    statevalue['ga_cid'] = ga;
                }else if(statevalue.hasOwnProperty('ga_cid') && !statevalue.hasOwnProperty('refcode') && !statevalue.hasOwnProperty('device')){
                    var trackCode = "_trackCode";
                    var arr,reg=new RegExp("(^| )"+trackCode+"=([^;]*)(;|$)");
                    var device = browserRedirect();
                    if(arr=document.cookie.match(reg)){
                        statevalue['refcode'] = unescape(arr[2]);
                        statevalue['device'] = device;
                    }
                }
                params[i] = encodeData(statevalue);
            }
        }
        var strParams = params.join('&');
        return arrUrlData[0]+'?state='+strParams;
    }
}
/**
 *数据编码处理函数
 */
function encodeData(data) {
    var state = btoa(encodeURIComponent(JSON.stringify(data)));
    return state;
}
/**
 *数据反编码解析函数
 */
function decodeData(data){
    var state = JSON.parse(decodeURIComponent(atob(data)));
    return state;
}

/**
 * 设备匹配函数
 * @returns {string}
 */
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


function setTrackCookieNull () {
    setCookie('_trackUserId', '',-1);
    setCookie('_trackCode', '',-1);
}

function setCookie(key,val,expires){
    var d = new Date();
    d.setTime(d.getTime() - 1);
    document.cookie = key+"="+val+";path=/;expires="+new Date(0).toUTCString();
}
