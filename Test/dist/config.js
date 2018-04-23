"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Requester2 = exports.Requester1 = undefined;

var _easyHttpAxios = require("easy-http-axios");

var _easyHttpAxios2 = _interopRequireDefault(_easyHttpAxios);

var _jsBase = require("js-base64");

var _easyHttp = require("easy-http");

var _easyHttp2 = _interopRequireDefault(_easyHttp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_easyHttp2.default.use(_easyHttpAxios2.default);

var Requester1 = exports.Requester1 = new _easyHttp2.default("https://miniptapi.innourl.com/Redpacket", {
    GetUserPlayInfo: {
        u: "/User/GetUserPlayInfo"
    }
}).addProcessor(function (e) {
    return _jsBase.Base64.encode(encodeURI(e));
});

var Requester2 = exports.Requester2 = new _easyHttp2.default("https://miniptapi.innourl.com/Redpacket", {
    GetUserPlayInfo: {
        u: "/User/GetUserPlayInfo/{userId:p}&{brandId}",
        h: 1
    },
    GetUserPlayInfo2: {
        u: "/User/GetUserPlayInfo/{userId}&{brandId}",
        d: ":p"
    }
}).bindDictate("p", function (e) {
    return _jsBase.Base64.encode(encodeURI(e));
});
//# sourceMappingURL=config.js.map