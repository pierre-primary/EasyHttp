const EasyHttp = require("easy-http");
const EasyHttpAxios = require("easy-http-axios");
const Base64 = require("js-base64").Base64;

EasyHttp.use(EasyHttpAxios);

const Requester1 = new EasyHttp("https://miniptapi.innourl.com/Redpacket", {
    GetUserPlayInfo: {
        u: "/User/GetUserPlayInfo/{userId}&{brandId}"
    }
}).addProcessor(e => {
    return Base64.encode(encodeURI(e));
});

const Requester2 = new EasyHttp("https://miniptapi.innourl.com/Redpacket", {
    GetUserPlayInfo: {
        u: "/User/GetUserPlayInfo/{userId:e:b}[&\\[{brandId}\\]]",
        h: 1
    },
    GetUserPlayInfo2: {
        u: "/User/GetUserPlayInfo/{userId}&{brandId}",
        d: ":e:b"
    }
})
    .bindDictate("e", e => {
        return encodeURI(e);
    })
    .bindDictate("b", e => {
        return Base64.encode(e);
    });

Requester1.GetUserPlayInfo({ userId: "dfsg%6#", brandId: 2, jj: 4, hjh: 6 });
Requester2.GetUserPlayInfo({ userId: "dfsg%6#", brandId: 2 });
Requester2.GetUserPlayInfo2({ userId: 'dfsg%6#;:=//&?" ', brandId: " " });
