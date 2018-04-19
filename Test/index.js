const EasyHttp = require("easy-http");
const EasyHttpAxios = require("easy-http-axios");
const Base64 = require("js-base64").Base64;

EasyHttp.use(EasyHttpAxios);
// EasyHttp.addProcessor(
//     e => {
//         return encodeURI(e);
//     },
//     e => {
//         return Base64.encode(e);
//     }
// );
EasyHttp.bindDictate("b", e => {
    return Base64.encode(e);
});
EasyHttp.bindDictate("e", e => {
    return encodeURI(e);
});

const Requester = new EasyHttp("https://miniptapi.innourl.com/Redpacket", {
    GetUserPlayInfo: {
        u: "/User/GetUserPlayInfo/{userId:e:b}&{brandId}"
    },
    GetUserPlayInfo2: {
        u: "/User/GetUserPlayInfo/{userId}&{brandId}"
    }
});

const Requester = new EasyHttp("https://miniptapi.innourl.com/Redpacket", {
    GetUserPlayInfo: {
        u: "/User/GetUserPlayInfo/{userId:e:b}&{brandId}"
    },
    GetUserPlayInfo2: {
        u: "/User/GetUserPlayInfo/{userId}&{brandId}"
    }
});



Requester.GetUserPlayInfo2({ userId: "dfsg%6#", brandId: 2 });
