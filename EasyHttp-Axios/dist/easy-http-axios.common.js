/*!
* easy-http-axios.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));

var Handlers = {
    get: function get(o) {
        return axios.get(o.url);
    },
    post: function post(o) {
        return axios.post(o.url);
    }
};

var easyHttpAxios = {
    install: function install(host) {
        host.bindHandler(function (o, c, er) {
            var act = (o.action || "").toLowerCase();
            if (Handlers[act]) {
                return Handlers[act](o, c, er);
            }
            throw "EasyHttpAxios:not found action '" + act + "'";
        });
    }
};

module.exports = easyHttpAxios;
