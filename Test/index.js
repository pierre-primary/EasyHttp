const EasyHttp = require("easy-http");
const EasyHttpAxios = require("easy-http-axios");
const Base64 = require("js-base64").Base64;
EasyHttp.use(EasyHttp);
EasyHttp.addProcessor(
    e => {
        return encodeURI(e);
    },
    e => {
        return Base64.encode(e);
    }
);

EasyHttp.bindDictate("b", e => {
    return Base64.encode(e);
});

const Requester = new EasyHttp("https://miniptapi.innourl.com/Redpacket", {
    GetUserPlayInfo: {
        u: "/User/GetUserPlayInfo/{userId}&{brandId}",
        d: ":b"
    },
    GetUserPlayInfo2: {
        u: "/User/GetUserPlayInfo/{userId}&{brandId}"
    }
});
Requester.GetUserPlayInfo({ userId: "dfsg%6#", brandId: 2 })
    .then(e => {
        console.log(e.data);
    })
    .catch(e => {
        console.log(2);
    });
Requester.GetUserPlayInfo2.c()({ userId: "dfsg%6#", brandId: 2 })
    .then(e => {
        console.log(e.data);
    })
    .catch(e => {
        console.log(2);
    });
