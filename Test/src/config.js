const EasyHttpAxios = require("easy-http-axios");
const Base64 = require("js-base64").Base64;
const EasyHttp = require("easy-http");

EasyHttp.use(EasyHttpAxios);

const Requester1 = new EasyHttp("https://miniptapi.innourl.com/Redpacket", {
    GetUserPlayInfo: {
        u: "/User/GetUserPlayInfo"
    }
}).addProcessor(e => {
    return Base64.encode(encodeURI(e));
});

const Requester2 = new EasyHttp("https://miniptapi.innourl.com/Redpacket", {
    GetUserPlayInfo: {
        u: "/User/GetUserPlayInfo/{userId:p}&{brandId}",
        h: 1
    },
    GetUserPlayInfo2: {
        u: "/User/GetUserPlayInfo/{userId}&{brandId}",
        d: ":p"
    }
}).bindDictate("p", e => {
    return Base64.encode(encodeURI(e));
});
module.exports = {
    Requester1,
    Requester2
};
