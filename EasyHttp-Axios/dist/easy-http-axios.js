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
        get: function get(o) {
            axios.get(o.url).then(function (response) {
                o.resolve(response);
            }).catch(function (error) {
                o.reject(error);
            });
        },
        post: function post(o) {
            axios.post(o.url).then(function (response) {
                o.resolve(response);
            }).catch(function (error) {
                o.reject(error);
            });
        }
    };

    var easyHttpAxios = {
        install: function install(host) {
            host.setHandler(function (o) {
                var act = (o.action || "").toLowerCase();
                if (Handlers[act]) {
                    Handlers[act](o);
                } else {
                    console.warn("EasyHttpAxios:not found action '" + act + "'");
                }
            });
        }
    };

    return easyHttpAxios;

})));
