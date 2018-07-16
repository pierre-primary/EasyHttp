/*!
* easy-http-axios.js v1.0.0-alpha1
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
        return axios.post(o.url, o.data);
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
