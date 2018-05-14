/*!
* easy-http-axios.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
import axios from 'axios';

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

export default easyHttpAxios;
