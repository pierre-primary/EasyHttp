/*!
* easy-http-axios.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));

var Handlers = {
    get: function get(o, c, er) {
        axios.get(o.url).then(function (res) {
            c(res.statusCode, res.data, res.header, res.errMsg);
        }).catch(function () {
            er(0, null, null, "");
        });
    },
    post: function post(o, c, er) {
        axios.post(o.url).then(function (res) {
            c(res.statusCode, res.data, res.header, res.errMsg);
        }).catch(function () {
            er(0, null, null, "");
        });
    }
};

var easyHttpAxios = {
    install: function install(host) {
        host.bindHandler(function (o, c, er) {
            var act = (o.action || "").toLowerCase();
            if (Handlers[act]) {
                Handlers[act](o, c, er);
            } else {
                console.warn("EasyHttpAxios:not found action '" + act + "'", "\n");
            }
        });
    }
};

module.exports = easyHttpAxios;
