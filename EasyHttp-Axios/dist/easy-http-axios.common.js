/*!
* easy-http-axios.js v1.0.0-alpha2
* (c) 2018-2018 PengYuan-Jiang
*/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));

var Handlers = {
    get: function get(o) {
        return axios.get(o.url, null, {
            headers: o.header
        });
    },
    post: function post(o) {
        axios.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
        return axios.post(o.url, o.data, {
            headers: o.header
        });
    }
};

var easyHttpAxios = {
    install: function install(host) {
        host.bindHandler(function (o) {
            var act = (o.action || "").toLowerCase();
            if (Handlers[act]) {
                return Handlers[act](o);
            }
            throw "EasyHttpAxios:not found action '" + act + "'";
        });
    }
};

module.exports = easyHttpAxios;
