window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
var zfManager = zfManager || {};

/**
 * 注入js脚本
 * @param pos 注入位置 head body
 * @param url js脚本连接
 */
zfManager.addScript = function(pos, url) {
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", url);
    document[pos].appendChild(script);
    return script;
}
// GA谷歌分析
zfManager.addGa = function () {
    $.get('/user/default/get-ga-id', function (res) {
        if (res) {
            var gid = decodeURIComponent(atob(res));
            // Global site tag (gtag.js) - Google Analytics begin
            // 官网文档https://developers.google.com/analytics/devguides/collection/gtagjs
            let gaScript = zfManager.addScript('head', "https://www.googletagmanager.com/gtag/js?id=" + gid);
            $.getScript('https://www.google-analytics.com/analytics.js', function(){
                setTimeout(function() {
                    let ga_client_id = '';
                    ga.getAll().forEach((tracker) => {
                        ga_client_id = tracker.get('clientId');
                    });

                    if(typeof gaCallback === "function") {
                        gaCallback(ga_client_id);
                    }
                }, 500);
            });
            gtag('js', new Date());
            gtag('config', gid);
        }
    });
}

zfManager.addGa();