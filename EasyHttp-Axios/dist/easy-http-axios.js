/*!
* easy-http-axios.js v1.0.0-alpha1
* (c) 2018-2018 PengYuan-Jiang
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('axios')) :
    typeof define === 'function' && define.amd ? define(['axios'], factory) :
    (global.EasyHttpAxios = factory(global.axios));
}(this, (function (axios) { 'use strict';

    axios = axios && axios.hasOwnProperty('default') ? axios['default'] : axios;

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

    return easyHttpAxios;

})));
