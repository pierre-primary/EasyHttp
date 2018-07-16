/*!
* easy-http-axios.js v1.0.2
* (c) 2018-2018 PengYuan-Jiang
*/
import axios from 'axios';

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

export default easyHttpAxios;
