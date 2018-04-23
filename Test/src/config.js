const EasyHttpAxios = require("easy-http-axios");
const Base64 = require("js-base64").Base64;
const EasyHttp = require("easy-http");

EasyHttp.use(EasyHttpAxios);

const Requester1 = new EasyHttp()
    .addProcessor(e => {
        return Base64.encode(encodeURI(e));
    })
    .setBaseUrl("https://miniptapi.innourl.com/Redpacket")
    .addRequests({
        GetUserPlayInfo: {
            u: "/User/GetUserPlayInfo/{userId}&{brandId}"
        }
    });

const Requester2 = new EasyHttp()
    .bindDictate("p", e => {
        return Base64.encode(encodeURI(e));
    })
    .setBaseUrl("https://miniptapi.innourl.com/Redpacket")
    .addRequests({
        GetUserPlayInfo: {
            u: "/User/GetUserPlayInfo/{userId:p}&{brandId}"
        },
        GetUserPlayInfo2: {
            u: "/User/GetUserPlayInfo/{userId}&{brandId}",
            d: ":p"
        }
    });
module.exports = {
    Requester1,
    Requester2
};
