/*!
* easy-http-axios.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('axios')) :
    typeof define === 'function' && define.amd ? define(['axios'], factory) :
    (global.EasyHttpAxios = factory(global.axios));
}(this, (function (axios) { 'use strict';

    axios = axios && axios.hasOwnProperty('default') ? axios['default'] : axios;

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

    return easyHttpAxios;

})));
