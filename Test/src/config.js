const EasyHttpAxios = require("easy-http-axios");
const Base64 = require("js-base64").Base64;
const EasyHttp = require("easy-http");

EasyHttp.use(EasyHttpAxios).bindDictate("p", value => {
        value = value || " ";
        return Base64.encode(encodeURI(value).toLowerCase());
    })
    //前置处理器
    .bindPreHandler(rq => {
        if (rq.params && rq.data) {
            console.log("EasyHttp-Request:", `[${rq.action}] ${rq.url}`, "\nparams:", rq.params, "\ndata:", rq.data);
        } else if (rq.params) {
            console.log("EasyHttp-Request:", `[${rq.action}] ${rq.url}`, "\nparams:", rq.params);
        } else if (rq.data) {
            console.log("EasyHttp-Request:", `[${rq.action}] ${rq.url}`, "\ndata:", rq.data);
        } else {
            console.log("EasyHttp-Request:", `[${rq.action}] ${rq.url}`);
        }
    })
    //后置处理器
    .bindPostHandler(promise => {
        return promise
            .then(e => {
                let rq = e.request;
                let rp = e.response;
                if (rp.code == 200) {
                    console.log("EasyHttp-Response:", `[${rq.action}] ${rq.url}`, "\nresponse:", rp.data);
                    return rp.data;
                } else {
                    console.log("EasyHttp-Response:", `[${rq.action}] ${rq.url}`, "\nresponse:", rp.data);
                    return Promise.reject(e);
                }
            });
    });

const Requester1 = new EasyHttp()
    .setDictate("p")
    .setBaseUrl("https://miniptapi.innourl.com/Redpacket")
    .addRequests({
        GetUserPlayInfo: "/User/GetUserPlayInfo/{userId}&{brandId}"
    });

const Requester2 = new EasyHttp()
    .setBaseUrl("https://miniptapi.innourl.com/Redpacket")
    .addRequests({
        GetUserPlayInfo: "/User/GetUserPlayInfo/{userId:p}&{brandId}",
        GetUserPlayInfo2: {
            u: "/User/GetUserPlayInfo/{userId}&{brandId}",
            d: ":p"
        },
        GetUserPlayInfo3: "/User/GetUserPlayInfo",
        GetUserPlayInfo4: "/User/GetUserPlayInfo/{userId}&{brandId}"
    });

module.exports = {
    Requester1,
    Requester2
};