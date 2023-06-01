/*! Popup v1.5.8 | (c) Zingfront.com | Zbase */

var time = 0;
var day = 0;
var session = 0;
var second = 0;
var logged_in_at = 0;
var countdownlimit = 0;
var showdate = {};
var leftsecond = 0;
var showCountDownInterval;
window.user_type = 0;
window.campaign_id = 0;

(function () {
    var popupDiv = document.createElement('div');
    $(popupDiv).attr({id: "showPopouDiv"})
    if (document.body != null) {
        document.body.appendChild(popupDiv);
    }
    if (this.CheckLocalStorage()) {
        return false;
    }
    this.LoadConfigInfo();
    var builtInPopups = $('.builtInPopup');
    builtInPopups.each(function (i, builtInPopup) {
        getBuiltInPopup(builtInPopup.id);
    });
})();


function CheckLocalStorage() {
    let storage = window.localStorage;
    let storageZbasePopupKey = 'zbasePopupConfigStorage';
    let storageZbasePopup = storage.getItem(storageZbasePopupKey);
    if (!storageZbasePopup) {
        return false;
    }
    let storageZbasePopupData = JSON.parse(storageZbasePopup);
    let localTimestamp = Date.parse(new Date()) / 1000;
    if (localTimestamp >= storageZbasePopupData.expire) {
        return false;
    }
    storageZbasePopupConfig = storageZbasePopupData.config;
    if (storageZbasePopupConfig.length === 0) {
        return true;
    }
    for (var i = 0; i < storageZbasePopupConfig.length; i++) {
        if (storageZbasePopupConfig[i].popup_conditions.day == 0
            && storageZbasePopupConfig[i].popup_conditions.session == 0) {
            continue;
        }
        if (day > 0) {
            if (localTimestamp > (day * 24 * 3600 + storageZbasePopupConfig.logged_in_at)) {
                this.LoadConfigInfoByStorage(storageZbasePopupConfig[i]);
            }
        }
    }
    return true;
}

function LoadConfigInfoByStorage(config) {
    $.ajax({
        type: "POST",
        url: "/user/popup/load-config-info-by-storage",
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        data: {
            config: config,
        },
        dataType: "json",
        success: function (data) {
            if (data.tips) {
                window.tips = data.tips;
            }
            window.campaign_id = data.campaign_id;
            window.user_type = data.user_type;

            if (data) {
                var popup_conditions = data.popup_conditions;
                if (popup_conditions == undefined) {
                    return false;
                }
                if (!popup_conditions.hasOwnProperty('is_popup')) {
                    return false;
                }
                var is_popup = popup_conditions.is_popup;
                if (is_popup == 0) {
                    return false;
                }
                var plugin_id = data.plugin_id;
                if (plugin_id != '') {
                    var isChrome = navigator.userAgent.indexOf('Chrome') > -1;
                    if (isChrome) {
                        if (chrome.runtime && chrome.runtime.sendMessage) {
                            try {
                                chrome.runtime.sendMessage(plugin_id,
                                    {message: 'version'},
                                    response => {
                                        if (chrome.runtime.lastError) {
                                            showDialog(data);
                                        }
                                        if (response) {
                                            return false;
                                        }
                                    });
                            } catch (e) {
                                showDialog(data);
                            }
                        } else {
                            showDialog(data);
                        }
                    }
                } else {
                    showDialog(data);
                }
            }
        }
    });
}

function setDataToStorage(popup_info) {
    let data = {
        expire: Date.parse(new Date()) / 1000 + 900,
        result: {},
        config: [],
    };
    let popup_info_data = JSON.parse(JSON.stringify(popup_info));
    if (popup_info_data.code !== 100000) {
        data.result = popup_info;
    } else {
        delete popup_info_data.template_html;
        delete popup_info_data.tips;
        data.config.push(popup_info_data);
    }
    let storage = window.localStorage;
    let storageZbasePopupKey = 'zbasePopupConfigStorage';
    storage.setItem(storageZbasePopupKey, JSON.stringify(data));
}

function LoadConfigInfo(product_name = '') {
    $.ajax({
        type: "POST",
        url: "/user/popup/load-config-info",
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        data: {
            product_name: '',
        },
        dataType: "json",
        success: function (data) {
            setDataToStorage(data);
            if (data.tips) {
                window.tips = data.tips;
            }
            window.campaign_id = data.campaign_id;
            window.user_type = data.user_type;

            if (data) {
                var popup_conditions = data.popup_conditions;
                if (popup_conditions == undefined) {
                    return false;
                }
                if (!popup_conditions.hasOwnProperty('is_popup')) {
                    return false;
                }
                var is_popup = popup_conditions.is_popup;
                if (is_popup == 0) {
                    return false;
                }
                var plugin_id = data.plugin_id;
                if (plugin_id != '') {
                    var isChrome = navigator.userAgent.indexOf('Chrome') > -1;
                    if (isChrome) {
                        if (chrome.runtime && chrome.runtime.sendMessage) {
                            try {
                                chrome.runtime.sendMessage(plugin_id,
                                    {message: 'version'},
                                    response => {
                                        if (chrome.runtime.lastError) {
                                            showDialog(data);
                                        }
                                        if (response) {
                                            return false;
                                        }
                                    });
                            } catch (e) {
                                showDialog(data);
                            }
                        } else {
                            showDialog(data);
                        }
                    }
                } else {
                    showDialog(data);
                }
            }
        }
    });
}


function getBuiltInPopup(code = '') {
    $.ajax({
        type: "POST",
        url: "/user/popup/get-build-in-popup",
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        data: {template_code: code},
        dataType: "json",
        success: function (data) {
            if (data.template_html) {
                $("#" + code).append(data.template_html);
            }
        }
    });
}

function getDropDownDetail() {
    var customTag = $(".popup-panel").find(".popup-nav-tabs-ul").html();
    var customDetail = $(".popup-panel").find(".tab-content").html();
    var noTag = isEmptyString(customTag);
    var noContent = isEmptyString(customDetail);
    var hasScoresList = $("popup-page-content") ? true : false;
    var scoreslist = '';
    //下拉内容为标签-内容
    if (noTag || noContent) {
        $(".popup-panel").find(".tab-content").html('<img src="https://zbase-global.zingfront.com/popup/img/loading.gif" style="width=28px;height:28px ">&ensp;');
        $("#popupAccordion").find(".glyphicon-triangle-bottom").attr("disabled", true);
        $.ajax({
            type: "post",
            url: "/user/popup/drop-down-content",
            contentType: 'application/x-www-form-urlencoded;charset=utf-8',
            dataType: "json",
            data: {
                campaign_id: window.campaign_id,
                hasScoresList: hasScoresList,
                fissionTrack: window.fissionTrack,
            },
            success: function (data) {
                $("#popupAccordion").find(".glyphicon-triangle-bottom").attr("disabled", false);
                $(".popup-panel").find(".popup-nav-tabs-ul").html(data.customTag);
                $(".popup-panel").find(".tab-content").html(data.customDetail);
                scoreslist = data.scoresRecord;
                popupPage(scoreslist);
            }
        });
    }
}

function isEmptyString(str) {
    return str == 'undefined' || !str || !/[^\s]/.test(str);
}

function sendLeadsToGA() {
    gtag('event', 'leads', {
        'event_category': 'leads_category',
        'event_label': 'leads_label',
        'value': 2
    });
}

function getFormData(current_campaign_id) {
    if (current_campaign_id == 'undefined' || isEmptyString(current_campaign_id)) {
        current_campaign_id = window.campaign_id;
    }
    //获取额外信息
    var popupFormData = {
        area_code: $("#user-area_code").val(),
        phone_number: $("#user-phone_number").val(),
        phone_validation_code: $("#phone_validation_code").val(),
        email: $("#email").val(),
        email_validation_code: $("#email_validation_code").val(),
        campaign_id: current_campaign_id,
    };

    var message = $("#showPopouDiv").find("input");
    var force_message = ["user-phone_number", 'email', "phone_validation_code", "email_validation_code"];
    for (var i = message.length - 1; i >= 0; i--) {
        var index = force_message.indexOf(message[i].id);
        if (index < 0) {
            var name = $(message[i]).attr("name");
            var value = $(message[i]).val();
            popupFormData[name] = value;
        }
    }
    var select_message = $("#showPopouDiv").find("select");
    for (var i = select_message.length - 1; i >= 0; i--) {
        if (select_message[i].id != "user-area_code") {
            var name = $(select_message[i]).attr("name");
            var value = $(select_message[i]).find("option:selected").text();
            popupFormData[name] = value;
        }
    }
    return popupFormData;
}

function submitAndClose(current_campaign_id) {
    if (current_campaign_id == 'undefined' || isEmptyString(current_campaign_id)) {
        current_campaign_id = window.campaign_id;
    }
    writeToLog();
    var flag = checkBeforeSubmit();
    if (!flag) {
        return;
    }
    //获取额外信息
    var popupFormData = getFormData(current_campaign_id);
    var value = $("#submit").html();
    $("#submit").html('<img src="https://zbase-global.zingfront.com/popup/img/loading.gif" style="width=20px;height:20px ">&ensp;' + value);
    $("#submit").attr("disabled", true);
    $.ajax({
        type: 'POST',
        url: '/user/popup/operate-user-message',
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        data: popupFormData,
        dataType: 'json',
        success(res) {
            $("#submit").html(value);
            $("#submit").attr("disabled", false);
            if (res.result) {
                $("#popup-content").attr("class", "popup-border-sign popup-hidden");
                $('#gray-mask').css('display', 'none');
            } else {
                if (res.message == 'Verification_code_error') {
                    var help = window.tips.Verification_code_error;
                    if (res.where == 'phone_number') {
                        $("#phone_validation_code").prev().html(help);
                    } else {
                        $("#email_validation_code").prev().html(help);
                    }
                } else if (res.message == 'Phone_number_already_exists') {
                    var help = window.tips.Phone_number_already_exists;
                    $("#user-phone_number").parent().prev().html(help);
                } else if (res.message == 'The_email_has_already_exists') {
                    var help = window.tips.The_email_has_already_exists;
                    $("#email").prev().html(help);
                }
            }
        }
    });
}

function submitAndMention(current_campaign_id) {
    if (current_campaign_id == 'undefined' || isEmptyString(current_campaign_id)) {
        current_campaign_id = window.campaign_id;
    }
    writeToLog();
    var flag = checkBeforeSubmit();
    if (!flag) {
        return;
    }
    //获取额外信息
    var popupFormData = getFormData(current_campaign_id);
    var value = $("#submit").html();
    $("#submit").html('<img src="https://zbase-global.zingfront.com/popup/img/loading.gif" style="width=20px;height:20px ">&ensp;' + value);
    $("#submit").attr("disabled", true);
    $.ajax({
        type: 'POST',
        url: '/user/popup/operate-user-message',
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        data: popupFormData,
        dataType: 'json',
        success(res) {
            $("#submit").html(value);
            $("#submit").attr("disabled", false);
            var submit_result = res.message;
            if (res.result) {
                if (window.tips.cta_ok_event) {
                    window.zbasePopupLeadData = popupFormData;
                    eval(window.tips.cta_ok_event);
                }
                $(".form-begin").css("display", "none");
                $element = "<div class=\"icon\"><img src=\"http://zbase-global.zingfront.com/popup/png/submit_success.png?v=12e1\" style=\"height:100px; width:100px;    margin-top: 50px;\"></div>";
                $mention = "<p style=\"margin-top:14px;text-align:center;font-size:15px;font-weight:600;\">" + submit_result + "!</p>";
                $element = $element + $mention;
                $(".result").append($element);
                $(".icon").css("margin", "0 auto");
                $button = "<div class=\"form-button\" style=\"margin-top: 40px;\"><button  style=\" width:120px; height: 40px; \" onclick=\"closeClick()\">" +
                    window.tips.ok + "</button></div>";
                $(".result").append($button);
                //显示提交成功
            } else {
                if (res.message == 'Verification_code_error') {
                    var help = window.tips.Verification_code_error;
                    if (res.where == 'phone_number') {
                        $("#phone_validation_code").parent().prev().html(help);
                    } else {
                        $("#email_validation_code").parent().prev().html(help);
                    }
                } else if (res.message == 'Phone_number_already_exists') {
                    var help = window.tips.Phone_number_already_exists;
                    var element = $("#user-phone_number").parent();
                    element.prev().html(help);
                    element.prev().css("color", "red");
                    element.parent().find(".blank").css("display", "block");

                } else if (res.message == 'The_email_has_already_exists') {
                    var help = window.tips.The_email_has_already_exists;
                    var element = $("#email");
                    element.prev().html(help);
                    element.prev().css("color", "red");
                } else {
                    // 显示提交失败
                    $(".form-begin").css("display", "none");
                    $element = "<div class=\"icon\"><img src=\"https://zbase-global.zingfront.com/popup/png/submit_fail.png?v=12e1\" style=\"height:100px; width:100px;margin-top: 50px;\"></div>";
                    $mention = "<p style=\"margin-top:14px;text-align:center;color:#f4121f;font-size:15px;font-weight:600;\">" + submit_result + "!</p>";
                    $element = $element + $mention;
                    $(".result").append($element);
                    $(".icon").css("margin", "0 auto");
                    $button = "<div class=\"form-button\" style=\"margin-top: 40px;\"><button  style=\" width:120px; height: 40px; \" onclick=\"closeClick()\">" +
                        window.tips.ok + "</button></div>";
                    $(".result").append($button);
                }
            }
        }
    });
}

function validateRequire(obj) {
    var flag = false;
    if (obj.value == '') {
        if (obj.id == "user-phone_number") {
            var help = $(obj).parent().parent().children(".help").html();
            if (isEmptyString(help)) {
                help = window.tips.cannot_be_blank;
                $(obj).parent().prev().html(help);
                $(obj).parent().prev().css("color", "red");
            }
            return false;
        } else if ($(obj).parent().hasClass("validate")) {
            var help = $(obj).parent().prev().html();
            if (isEmptyString(help)) {
                $(obj).parent().prev().html(window.tips.cannot_be_blank);
            }
            return false;
        } else if ($(obj)[0].tagName == 'SELECT') {
            if ($(obj).children()[0].text.length != 0) {
                var help = '';
                if ($(obj).parent().children(".help").length != 0) {
                    help = $(obj).parent().children(".help").html();
                    if (isEmptyString(help)) {
                        var mention = window.tips.cannot_be_blank;
                        $(obj).before(mention);
                        $(obj).prev().css("color", "red");
                        return false;
                    } else {
                        return false;
                    }
                } else {
                    var mention = window.tips.cannot_be_blank;
                    help = '<span class="help" style="color: red;">' + mention + '</span>';
                    $(obj).before(help);
                    $(obj).prev().css("color", "red");
                    return false;
                }
            }
        } else {
            var help = $(obj).parent().children(".help").html();
            if (isEmptyString(help)) {
                var help = window.tips.cannot_be_blank;
                $(obj).prev().html(help);
                $(obj).prev().css("color", "red");
            }
            return false;
        }
    } else {
        flag = true;
        if (obj.id == "user-phone_number") {
            var help = $(obj).parent().parent().children(".help").html();
            if (!isEmptyString(help)) {
                $(obj).parent().prev().html(" ");
            }
        } else if ($(obj).parent().hasClass("validate")) {
            var help = $(obj).parent().parent().children(".help").html();
            if (!isEmptyString(help)) {
                $(obj).parent().prev().html(" ");
            }
        } else if ($(obj).attr("tagName") == 'select') {
            if ($(obj).children()[0].text.length != 0) {
                var help = '';
                if ($(obj).parent().children(".help").length != 0) {
                    help = $(obj).parent().children(".help").html();
                    if (!isEmptyString(help)) {
                        $(obj).parent().children(".help").html(" ");
                    }
                }
            }
        } else {
            var help = $(obj).parent().children(".help").html();
            if (!isEmptyString(help)) {
                $(obj).parent().find(".help").html(" ");
            }
        }
    }
    return flag;
}

function checkBeforeSubmit() {
    var is_valid = false;
    is_valid = validateTelFormat();
    if (!is_valid) {
        return false;
    }
    is_valid = validateMailFormat();
    if (!is_valid) {
        return false;
    }
    //证必要字段不能为空
    var arr = $(".required");
    for (var i = 0; i < arr.length; i++) {
        is_valid = validateRequire(arr[i]);
        if (!is_valid) {
            return false;
        }
    }
    return true;
}



function validateTelFormat() {
    var is_valid = true;
    //获取电话号码
    var phone_number = $("#user-phone_number").val();
    if (!isEmptyString(phone_number)) {
        var reg = '';
        var area_code = $("#user-area_code").val();
        if (area_code == '86') {
            if (phone_number.length != 11) {
                var help = window.tips.wrong_format;
                $("#user-phone_number").parent().prev().html(help);
                return false;
            }
            reg = /^1[3|4|5|6|7|8|9]\d{9}$/;
        } else {
            reg = /^[0-9]{1,}$/;
        }
        //判断电话号码是否合法
        var vali = reg.test(phone_number);
        if (!vali) {
            var help = window.tips.wrong_format;
            $("#user-phone_number").parent().prev().html(help);
            return false;
        } else {
            $("#user-phone_number").parent().prev().html(' ');
        }
    }
    return is_valid;
}

function validateMailFormat() {
    var is_valid = true;
    //获取邮箱信息
    var mail = $("#email").val();
    if (!isEmptyString(mail)) {
        var reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
        if (!reg.test(mail)) {
            var help = window.tips.wrong_format;
            $("#email").prev().html(help);
            return false;
        } else {
            var help = $("#email").prev().html();
            if (!isEmptyString(help)) {
                $("#email").prev().html(' ');
            }
        }
    }
    return is_valid;
}

/**
 * 短信验证码计数
 */
function setTime(obj, countdown, timerTag, color, btnText) {
    var btnText = btnText;
    if (countdown < 0) {
        countdown = 60;
        $(obj).removeAttr("disabled");
        $(obj).html(btnText);
        $(obj).css("background-color", color);
        //重制
        try {
            if(window.showPopupSig) {
                //重新加载滑块
                loadSig();
            }
        } catch (error) {

        }

    } else {
        $(obj).html(btnText + "(" + countdown + ")");
        countdown--;
        window.timerTag = setTimeout(function () {
            setTime(obj, countdown, timerTag, color, btnText);
        }, 1000);
    }
}

window.timerTag = 0;


//加载"滑块"
function loadSig() {
    //先记录"send"按钮的颜色
    var color = $("#send_validation").css("background-color");
    //将"send"按钮，标记为"初始不可点击"
    $("#send_validation").attr("disabled", "disabled");
    $("#send_validation").css("background-color", "#999");

    var nc_token = ["FFFF0N0N0000000073DB", (new Date()).getTime(), Math.random()].join(":");
    var NC_Opt =
        {
            renderTo: "#sc1",
            appkey: "FFFF0N0N0000000073DB",
            scene: "nc_login",
            token: nc_token,
            customWidth: 300,
            trans:{"key1":"code0"},
            elementID: ["usernameID"],
            is_Opt: 0,
            language: "cn",
            isEnabled: true,
            timeout: 3000,
            times:5,
            apimap: {
                // "analyze": "//a.com/nocaptcha/analyze.jsonp",
                // "get_captcha": "//b.com/get_captcha/ver3",
                // "get_captcha": "//pin3.aliyun.com/get_captcha/ver3",
                // "get_img": "//c.com/get_img",
                // "checkcode": "//d.com/captcha/checkcode.jsonp",
                // "umid_Url": "//e.com/security/umscript/3.2.1/um.js",
                // "uab_Url": "//aeu.alicdn.com/js/uac/909.js",
                // "umid_serUrl": "https://g.com/service/um.json"
            },
            callback: function (data) {
                if(
                    (data.hasOwnProperty("token") &&
                        data.token != null &&
                        data.token != undefined
                    ) &&
                    (data.hasOwnProperty("csessionid") &&
                        data.csessionid != null &&
                        data.csessionid != undefined
                    ) &&
                    (data.hasOwnProperty("sig") && data.sig != null && data.sig != undefined)
                ){
                    //将"send"按钮，标记为"可点击"
                    $("#send_validation").removeAttr("disabled");
                    $("#send_validation").css("background-color", color);
                    $("#sc1").append("<input id=\'popup_nc_token\' name=\'nc_token\' value=\'"
                        + data.token+"\' hidden>");
                    $("#sc1").append("<input id=\'popup_sessionid\' name=\'sessionid\' value=\'"
                        + data.csessionid+"\' hidden>");
                    $("#sc1").append("<input id=\'popup_sig\' name=\'sig\' value=\'"+data.sig+"\' hidden>");
                    $("#beforeSubmit").attr("disabled",false);
                }
            }
        }

    $("#send_validation").attr("disabled",true);
    var langArr = {
        "zh-CN": "cn",
        "es-US": "en",
        "ja-JP": "ja_JP",
        "de-DE": "de_DE",
        "es-ES": "es_ES",
        "fr-FR": "fr_FR",
        "ru-RU": "ru_RU",
    };
    var currentLang = "<?=\Yii::$app->language?>";
    var lang = "en";
    if(langArr.hasOwnProperty(currentLang)){
        lang = langArr[currentLang];
    }
    NC_Opt.language = lang;
    var nc = new noCaptcha(NC_Opt);
}

//是否显示滑块
window.showPopupSig = false;

/**
 * 发送电话验证码
 *
 */
function sendTelValidation(obj, current_campaign_id) {

    if (current_campaign_id == 'undefined' || isEmptyString(current_campaign_id)) {
        current_campaign_id = window.campaign_id;
    }
    //获取电话号码
    var phone_number = $("#user-phone_number").val();
    var color = $(obj).css("background-color");
    var btnText = $(obj).html();

    //判断电话号码是否为空
    if (phone_number.length == 0) {
        var help = window.tips.cannot_be_blank;
        $("#user-phone_number").parent().prev().html(help);
        return;
    } else {
        //判断电话号码是否合法
        var countdown = 60;
        var vali = validateTelFormat();
        if (!vali) {
            var help = window.tips.wrong_format;
            $("#user-phone_number").parent().prev().html(help);
        } else {
            $("#user-phone_number").parent().prev().html("");
            var area_code = $("#user-area_code").val();

            //增加滑块的校验的参数
            var nc_token = $("#popup_nc_token") !== undefined?$("#popup_nc_token").val():"";
            var sessionid = $("#popup_sessionid") !== undefined?$("#popup_sessionid").val():"";
            var sig = $("#popup_sig") !== undefined?$("#popup_sig").val():"";

            //发送验证码
            $.ajax({
                type: "post",
                url: "/user/popup/send-tel-validation",
                contentType: "application/x-www-form-urlencoded;charset=utf-8",
                data: {
                    phone_number: phone_number,
                    area_code: area_code,
                    campaign_id: current_campaign_id,
                    nc_token: nc_token,
                    sessionid: sessionid,
                    sig: sig
                },
                dataType: "json",
                beforeSend: function () {

                    setTime(obj, countdown, window.timerTag, color, btnText);
                    $(obj).attr("disabled", "disabled");
                    $(obj).css("background-color", "#999");
                },
                success(data) {

                    var next_send_flag = data.next_send_flag;

                    //需要加载滑块
                    //兼容之前的代码(data中没有next_send_flag字段)
                    if(undefined !== next_send_flag && !next_send_flag) {
                        //用于标记，需要显示滑块
                        window.showPopupSig = true;
                    }

                    if (data.result) {
                        $("#phone_validation_code").parent().prev().html(' ');

                    } else if (data.message == 'fail_send_validation') {
                        var help = window.tips.fail_send_validation;
                        $("#phone_validation_code").parent().prev().html(help);
                        $(obj).removeAttr("disabled");
                        clearTimeout(timerTag);
                        $(obj).html(btnText);
                        $(obj).css("background-color", color);
                    } else if (data.message == 'Phone_number_already_exists') {
                        var help = window.tips.Phone_number_already_exists;
                        $("#user-phone_number").parent().prev().html(help);
                        $(obj).removeAttr("disabled");
                        clearTimeout(timerTag);
                        $(obj).html(btnText);
                        $(obj).css("background-color", color);
                    } else {
                        var help = data.message;
                        $("#phone_validation_code").parent().prev().html(help);
                        $(obj).removeAttr("disabled");
                        clearTimeout(timerTag);
                        $(obj).html(btnText);
                        $(obj).css("background-color", color);
                    }


                },
                error(e) {
                    var help = window.tips.fail_send_validation;
                    $("#phone_validation_code").parent().prev().html(help);
                    $(obj).removeAttr("disabled");
                    clearTimeout(timerTag);
                    $(obj).html(btnText);
                    $(obj).css("background-color", color);

                }
            });
        }
    }
}

/**
 * 发送邮箱验证码
 */
function sendMailValidation(obj, current_campaign_id) {
    if (current_campaign_id == 'undefined' || isEmptyString(current_campaign_id)) {
        current_campaign_id = window.campaign_id;
    }
    var mail = $("#email").val();
    var color = $(obj).css("background-color");
    var btnText = $(obj).html();
    if (mail.length == 0) {
        var help = window.tips.cannot_be_blank;
        $("#email").prev().html(help);
    } else {
        var reg = /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/;
        var countdown = 60;
        if (!reg.test(mail)) {
            var help = window.tips.wrong_format;
            $("#email").prev().html(help);
        } else {
            $("#email").prev().html("");
            $.ajax({
                type: "post",
                url: "/user/popup/send-mail-validation",
                contentType: "application/x-www-form-urlencoded;charset=utf-8",
                data: {
                    mail: mail,
                    campaign_id: current_campaign_id,
                },
                dataType: "json",
                beforeSend: function () {
                    setTime(obj, countdown, window.timerTag, color, btnText);
                    $(obj).attr("disabled", "disabled");
                    $(obj).css("background-color", "#999");
                },
                success(res) {
                    if (res.result) {

                    } else if (res.message == 'fail_send_validation') {
                        var help = window.tips.fail_send_validation;
                        $("#email_validation_code").parent().prev().html(help);
                        $(obj).removeAttr("disabled");
                        clearTimeout(timerTag);
                        $(obj).html(btnText);
                        $(obj).css("background-color", color);
                    } else if (res.message == 'The_email_has_already_exists') {
                        var help = window.tips.The_email_has_already_exists;
                        $("#email").prev().html(help);
                        $(obj).removeAttr("disabled");
                        clearTimeout(timerTag);
                        $(obj).html(btnText);
                        $(obj).css("background-color", color);
                    }
                }
            });
        }
    }
}


function showDialog(data) {
    popup_conditions = data.popup_conditions;
    logged_in_at = data.logged_in_at;
    countdownlimit = data.countdown*1000;
    showdate = data.showdate;
    var trigger_type = popup_conditions.trigger_type;
    var is_popup = popup_conditions.is_popup;
    time = popup_conditions.conditions['time'];
    day = popup_conditions.conditions['day'];
    session = popup_conditions.conditions['session'];
    if ($("#showPopouDiv").html() != '') {
        $("#showPopouDiv").empty();
    }
    $("#showPopouDiv").append(data.template_html);
    $("#popup-content").attr("class", "popup-border-sign popup-hidden");
    if (trigger_type == 1 && is_popup == 1) {
        if (session != 0 && day != 0) {
            popupByDayAndSession(day, session, logged_in_at);
        } else {
            popupOnlyOnce();
        }
        if (data.hasOwnProperty('scoreslist')) {
            popupPage(data.scoreslist);
        }
    }
    if (trigger_type == 2 && is_popup == 1) {
        popupByClose();
    }
}

function recordPop() {
    $.ajax({
        type: "POST",
        url: "/user/popup/record-pop",
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        data: {
            campaign_id: window.campaign_id,
            user_type: window.user_type,
        },
        dataType: "json",
        success: function (data) {

        }
    });
}

function interval() {
    if (time > 0) {
        second++;
        if (second == time) {
            var classdes = $("#popup-content").attr("class");
            //当前弹窗有内容且css样式为隐藏的时候将弹窗设置为显示状态
            if (classdes == 'popup-border-sign popup-hidden' && window.campaign_id) {
                $("#popup-content").attr("class", "popup-border-sign popup-border-fixed-sign");
                var grayScreen = "<div id='gray-mask' style='position:fixed;width:100%;height:100%;top:0;left:0;right: 0;bottom: 0; background:rgba(0,0,0,0.3);z-index:9998;'></div>";
                //被显示出来的时候才做计数
                recordPop();
                $("body").append(grayScreen);
                showCountDown();
                if(countdownlimit>0){
                    window.setTimeout("countdown();", countdownlimit);
                }
                return false;
            }
        }
        window.setTimeout("interval();", 1000);
    }
}

function popupByDayAndSession(day, session, logged_in_at) {
    if (day != 0) {
        if (session != 0) {
            now_time = '<?= time()?>';
            time_diff = (now_time - logged_in_at) / 60;
            if (time_diff < session) {
                return false;
            } else {
                window.setTimeout("interval();", 1000);
                return false;
            }
        }
    }
}

function popupOnlyOnce() {
    window.setTimeout("interval();", 1000);
    return false;
}

function popupByClose() {
    // window.onbeforeunload = onbeforeunload_handler;

    // function onbeforeunload_handler() {
    //     $("#popup-content").attr("class", "popup-border-sign popup-border-fixed-sign");
    //     var grayScreen = "<div id='gray-mask' style='position:fixed;width:100%;height:100%;top:0;left:0;right: 0;bottom: 0; background:rgba(0,0,0,0.3);z-index:9998;'></div>";
    //     $("body").append(grayScreen);
    //     return false;
    // }
}

function callZbasePopupOpen(popup_campaign_id) {
    var load = $('#loading').length;
    if (load == 0) {
        var loadingDiv = document.createElement('div');
        $(loadingDiv).attr({
            id: "loading",
            style: "position:fixed;top:0;bottom:0;right:0;left:0;background-color:black;opacity:0.4;z-index:5000;"
        });
        var loadGif = "<img src='https://zbase-global.zingfront.com/static/imgs/loading.gif' style='position:fixed;height:128px;width:128px;left:50%;top:50%;transform: translate(-50%, -50%);z-index:5001;'>"
        $(loadingDiv).append(loadGif);
        document.body.appendChild(loadingDiv);
    }
    $('#loading').show();
    $.ajax({
        type: "get",
        url: "/user/popup/zbase-popup",
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        dataType: "json",
        data: {
            call_popup: popup_campaign_id
        },
        success: function (res) {
            if (isEmptyObject(res)) {
                $('#gray-mask').remove();
                $('#loading').hide();
                return false;
            }
            // 如果无法正常弹出则关闭遮罩
            if (res.hasOwnProperty('code') && res.code !== 100000) {
                setTimeout(() => {
                    $('#gray-mask').remove();
                    $('#loading').hide();
                }, 200);
                return false;
            }
            if (res.tips) {
                window.tips = res.tips;
            }
            window.campaign_id = res.campaign_id;
            window.user_type = res.user_type;
            recordPop();
            $('#loading').hide();
            var elem = document.getElementById('showPopouDiv');
            var gray = document.getElementById('gray-mask');
            if (elem != null || elem) {
                elem.parentNode.removeChild(elem);
            }
            if (gray != null || gray) {
                gray.parentNode.removeChild(gray);
            }
            var popupDiv = document.createElement('div');
            $(popupDiv).attr({id: "showPopouDiv"})
            document.body.appendChild(popupDiv);
            $("#showPopouDiv").append(res.template_html);
            $("#popup-content").attr("class", "popup-border-sign popup-border-fixed-sign");
            var grayScreen = "<div id='gray-mask' style='position:fixed;width:100%;height:100%;top:0;left:0;right: 0;bottom: 0; background:rgba(0,0,0,0.3);z-index:9998;'></div>";
            $("body").append(grayScreen);
            if (res.hasOwnProperty('scoreslist')) {
                popupPage(res.scoreslist);
            }
            countdownlimit = res.countdown*1000;
            showdate = res.showdate;
            showCountDown();
            if(countdownlimit>0){
                window.setTimeout("countdown();", countdownlimit);
            }
            return false;
        },
        error: function (e) {
            // 出现异常则清除遮罩
            setTimeout(() => {
                $('#gray-mask').remove();
                $('#loading').hide();
            }, 200);
            return false;
        }
    });
}

function isEmptyObject(obj) {
    for (var attr in obj) {
        return false;
    }
    return true;
}

function closeClick() {
    $("#popup-content").attr("class", "popup-border-sign popup-hidden");
    $('#gray-mask').remove();
    $('#loading').hide();
    $.ajax({
        type: "POST",
        url: "/user/popup/save-cookie",
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        data: {name: 'zbase_popup_' + window.campaign_id, value: 'isPopup' + window.campaign_id, expire: day},
        dataType: "json",
    });
    window.setTimeout('this.LoadConfigInfo()', 1000);
}

function shareClick(network, networkUrl, title) {
    $.ajax({
        type: "POST",
        url: "/user/popup/share-click",
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        data: {campaign_id: window.campaign_id, user_type: window.user_type},
        dataType: "json",
    });
    var is_number = !isNaN(Number(network));
    if (is_number) {
        network = Number(network);
        if (network == 0) {
            // 关闭
            closeClick();
        } else if (network == 1) {
            // 打开链接
            window.open(networkUrl);
        } else if (network == 2) {
            // 执行事件
            eval(networkUrl);
        }
        return true;
    }
    if (network == 'custom' || network == '' || network == '[%customType%]') {
        window.open(networkUrl);
    } else {
        sharePopup(network, networkUrl, title);
    }
}

function buttonCopy() {
    $.ajax({
        type: "POST",
        url: "/user/popup/share-click",
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        data: {campaign_id: window.campaign_id, user_type: window.user_type},
        dataType: "json",
    });
    var inputUrl = document.getElementById('popup-link-url-sign');
    inputUrl.select();
    if (document.execCommand("Copy")) {
        $(document.getElementById("popup-link-url-sign").parentNode.children[1].children[0]).attr("src", "https://zbase-global.zingfront.com/popup/images/copy_complete.png");
        $(document.getElementById("popup-link-url-sign").parentNode.children[1].children[0]).css({
            'height': '20px',
            "width": "25px"
        });
    }
    return false;
}

function sharePopup(type, networkUrl, title) {
    var toOpen = function (url) {
        var option = 'toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=1000, height=600,top=100,left=350';
        window.open(
            url, '_blank', option,
        );
    };
    if (networkUrl == '') {
        networkUrl = encodeURIComponent(document.location.href);
    }
    if (title == '') {
        title = encodeURIComponent(document.location.href);
    }
    switch (type) {
        case 'facebook':
            toOpen('http://www.facebook.com/sharer.php?u=' + networkUrl + '&t=' + title);
            break;
        case 'google':
            toOpen('https://plus.google.com/share?url=' + networkUrl + '&t=' + title);
            break;
        case 'twitter':
            toOpen('http://twitter.com/share?url=' + networkUrl + '&text=' + title);
            break;
        case 'linkedin':
            toOpen('http://www.linkedin.com/shareArticle?mini=true&url=' + networkUrl + '&title=' + title);
            break;
    }
}

function popupAccordion() {
    var acc = document.getElementById("popupAccordion");
    var panel = acc.nextElementSibling;
    if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
    } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
        panel.style.boxShadow = "0px 20px 10px 5px #999";
        panel.className = 'popup-panel pull-panel';
    }
}


;(function ($, window, document, undefined) {
    'use strict';

    function Paging(element, options) {
        this.element = element;
        this.options = {
            nowPage: options.nowPage || 1, // 当前页码
            pageNum: options.pageNum, // 总页码
            canJump: options.canJump || 0, // 是否能跳转。0=不显示（默认），1=显示
            showOne: options.showOne || 1,//只有一页时，是否显示。0=不显示,1=显示（默认）
            buttonNum: (options.buttonNum >= 5 ? options.buttonNum : 5) || 7,// 页面显示页码数量
            callback: options.callback // 回调函数
        };
        this.init();
    }

    Paging.prototype = {
        constructor: Paging,
        init: function () {
            this.createHtml();
            this.bindClickEvent();
            this.disabled();
        },
        createHtml: function () {
            var me = this;
            var nowPage = this.options.nowPage;
            var pageNum = this.options.pageNum;
            var buttonNum = this.options.buttonNum;
            var canJump = this.options.canJump;
            var showOne = this.options.showOne;
            var content = [];
            //对nowPage进行判断
            nowPage = nowPage > pageNum ? pageNum : nowPage;
            nowPage = nowPage < 1 ? 1 : nowPage;
            //如果只有一页并且设置为不显示，则不进行渲染
            if (showOne && pageNum === 1) {
                return '';
            }
            content.push("<ul>");
            content.push("<li class='xl-prevPage'>\<</li>");
            //页面总数小于等于当前要展示页数总数，展示所有页面
            if (pageNum <= buttonNum) {
                for (var i = 1; i <= pageNum; i++) {
                    if (nowPage !== i) {
                        content.push("<li>" + i + "</li>");
                    } else {
                        content.push("<li class='xl-active'>" + i + "</li>");
                    }
                }
            } else if (nowPage <= Math.floor(buttonNum / 2)) {
                //当前页面小于等于展示页数总数的一半（向下取整），从1开始
                for (var i = 1; i <= buttonNum - 2; i++) {
                    if (nowPage !== i) {
                        content.push("<li>" + i + "</li>");
                    } else {
                        content.push("<li class='xl-active'>" + i + "</li>");
                    }
                }
                content.push("<li class='xl-disabled'>...</li>");
                content.push("<li>" + pageNum + "</li>");
            } else if (pageNum - nowPage <= Math.floor(buttonNum / 2)) {
                //当前页面大于展示页数总数的一半（向下取整）
                content.push("<li>" + 1 + "</li>");
                content.push("<li class='xl-disabled'>...</li>");
                for (var i = pageNum - buttonNum + 3; i <= pageNum; i++) {
                    if (nowPage !== i) {
                        content.push("<li>" + i + "</li>");
                    } else {
                        content.push("<li class='xl-active'>" + i + "</li>");
                    }
                }
            } else {
                //前半部分页码
                if (nowPage - Math.floor(buttonNum / 2) <= 0) {
                    for (var i = 1; i <= Math.floor(buttonNum / 2); i++) {
                        if (nowPage !== i) {
                            content.push("<li>" + i + "</li>");
                        } else {
                            content.push("<li class='xl-active'>" + i + "</li>");
                        }
                    }
                } else {
                    content.push("<li>" + 1 + "</li>");
                    content.push("<li class='xl-disabled'>...</li>");
                    for (var i = nowPage - Math.floor(buttonNum / 2) + (buttonNum % 2 == 0 ? 3 : 2); i <= nowPage; i++) {
                        if (nowPage !== i) {
                            content.push("<li>" + i + "</li>");
                        } else {
                            content.push("<li class='xl-active'>" + i + "</li>");
                        }
                    }

                }
                //后半部分页码
                if (pageNum - nowPage <= 0) {
                    for (var i = nowPage + 1; i <= pageNum; i++) {
                        content.push("<li>" + i + "</li>");
                    }
                } else {
                    for (var i = nowPage + 1; i <= nowPage + Math.floor(buttonNum / 2) - 2; i++) {
                        content.push("<li>" + i + "</li>");
                    }
                    content.push("<li class='xl-disabled'>...</li>");
                    content.push("<li>" + pageNum + "</li>");
                }
            }
            content.push("<li class='xl-nextPage'>\></li>");
            // if(canJump){
            //  content.push("<li class='xl-jumpText xl-disabled'>跳转到<input type='number' id='xlJumpNum'>页</li>");
            //  content.push("<li class='xl-jumpButton'>确定</li>");
            // }
            content.push("</ul>");
            me.element.html(content.join(''));
            // DOM重新生成后每次调用是否禁用button
            setTimeout(function () {
                me.disabled();
            }, 20);

        },
        bindClickEvent: function () {
            var me = this;
            me.element.off('click', 'li');
            me.element.on('click', 'li', function () {
                var cla = $(this).attr('class');
                var num = parseInt($(this).html());
                var nowPage = me.options.nowPage;
                if ($(this).hasClass('xl-disabled') || cla === 'xl-jumpText') {
                    return '';
                }
                if (cla === 'xl-prevPage') {
                    if (nowPage !== 1) {
                        me.options.nowPage -= 1;
                    }
                } else if (cla === 'xl-nextPage') {
                    if (nowPage !== me.options.pageNum) {
                        me.options.nowPage += 1;
                    }
                } else if (cla === 'xl-jumpButton') {
                    me.options.nowPage = Number($('#xlJumpNum').val());
                } else {
                    me.options.nowPage = num;
                }
                me.createHtml();
                if (me.options.callback) {
                    me.options.callback(me.options.nowPage);
                }
            });

        },
        disabled: function () {
            var me = this;
            var nowPage = me.options.nowPage;
            var pageNum = me.options.pageNum;
            if (nowPage === 1) {
                me.element.children().children('.xl-prevPage').addClass('xl-disabled');
            } else if (nowPage === pageNum) {
                me.element.children().children('.xl-nextPage').addClass('xl-disabled');
            }
        }
    }
    $.fn.paging = function (options) {
        return new Paging($(this), options);
    }
})(jQuery, window, document);

function popupPage(scoreslist) {
    if (typeof scoreslist != 'object') {
        return '';
    }
    if (!scoreslist.hasOwnProperty('total') || !scoreslist.hasOwnProperty('data')) {
        return '';
    }
    var download_content = document.getElementById("popup-page-content");
    if (download_content == null) {
        return '';
    }
    popupPageData = scoreslist.data;
    var title = '<tr><td>' + window.tips.score + '</td><td>' + window.tips.task + '</td><td>' + window.tips.time + '</td></tr>';
    var popupPageHtml = title;
    for (var i = 0; i < popupPageData.length; i++) {
        if (popupPageData[i].scores > 0) {
            popupPageData[i].scores = '+' + popupPageData[i].scores;
        }
        popupPageHtml += '<tr><td>' + popupPageData[i].scores + '</td><td>' + popupPageData[i].title + '</td><td>' + popupPageData[i].time + '</td></tr>'
    }

    document.getElementById("popup-page-content").innerHTML = popupPageHtml;
    $("#popup-page").paging({
        nowPage: scoreslist.currentpage, // 当前页码
        pageNum: scoreslist.page, // 总页码
        buttonNum: scoreslist.total, //要展示的页码数量
        callback: function (num) { //回调函数
            var popupPageData = {};
            $.ajax({
                type: "GET",
                url: "/user/popup/pop-scores-list",
                contentType: 'application/x-www-form-urlencoded;charset=utf-8',
                data: {page: num},
                dataType: "json",
                success: function (data) {
                    var popupPageData = data.data;
                    popupPageHtml = title;
                    for (var i = 0; i < popupPageData.length; i++) {
                        if (popupPageData[i].scores > 0) {
                            popupPageData[i].scores = '+' + popupPageData[i].scores;
                        }
                        popupPageHtml += '<tr><td>' + popupPageData[i].scores + '</td><td>' + popupPageData[i].title + '</td><td>' + popupPageData[i].time + '</td></tr>'
                    }
                    document.getElementById("popup-page-content").innerHTML = popupPageHtml;
                }
            });
        }
    });
}

/**
 * 写弹窗点击日志
 */
function writeToLog() {
    $.ajax({
        type: "POST",
        url: "/user/popup/share-click",
        contentType: 'application/x-www-form-urlencoded;charset=utf-8',
        data: {campaign_id: window.campaign_id, user_type: window.user_type},
        dataType: "json",
    });
}

/**
 * 关闭弹窗
 */
function countdown() {
    $("#popup-content").attr("class", "popup-border-sign popup-hidden");
    $('#gray-mask').remove();
}
function showCountDownBySecond()
{
    //判断是否到活动时间 如果到活动时间 全部默认显示00：00：00
    if (leftsecond > 0) {
        leftsecond--;
        // var day1 = Math.floor(leftsecond / (60 * 60 * 24));
        var day1 = 0;
        // var hour1 = Math.floor((leftsecond - day1 * 24 * 60 * 60) / 3600);
        var hour = Math.floor((leftsecond) / 3600);
        //小时如果不大于0 显示为0
        if (hour > 0) {

        } else {
            hour = 0;
        }
        var minute = Math.floor((leftsecond - hour * 3600) / 60);
        var second = Math.floor(leftsecond  - hour * 3600 - minute * 60);
        // document.getElementById("daoYear").innerHTML = year + "年";
        // document.getElementById("daoMonth").innerHTML = month + "月";
        // document.getElementById("daoDay").innerHTML = day + "日";
        document.getElementById("djs-h").innerHTML = supplement(hour);
        document.getElementById("djs-m").innerHTML = supplement(minute);
        document.getElementById("djs-s").innerHTML = supplement(second);
    } else {
        // document.getElementById("daoYear").innerHTML = "0000" + "年";
        // document.getElementById("daoMonth").innerHTML = "00" + "月";
        // document.getElementById("daoDay").innerHTML = "00" + "日";
        document.getElementById("djs-h").innerHTML = "00";
        document.getElementById("djs-m").innerHTML = "00";
        document.getElementById("djs-s").innerHTML = "00";
        clearInterval(showCountDownInterval);
    }
}
function showCountDown() {
    var type = showdate?showdate.type:0;
    leftsecond = showdate?showdate.time:-1;

    if(type === '2'){
        //固定时间倒计时
        var now = new Date();
        var leftTime = leftsecond*1000 - now.getTime();
        leftsecond = parseInt(leftTime / 1000);
        showCountDownInterval = window.setInterval("showCountDownBySecond(leftsecond);", 1000);
    }else if(type === '1'){
        showCountDownInterval = window.setInterval("showCountDownBySecond(leftsecond);", 1000);
    }else{
        $('.show-date').css('display', 'none');
    }
}
function supplement(nn) {
    return (nn = nn < 10 ? "0" + nn : nn);
}