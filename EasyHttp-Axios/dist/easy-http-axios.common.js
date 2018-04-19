/*!
* easy-http-axios.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var axios = _interopDefault(require('axios'));

function get(resolve, reject, url) {
    axios.get(url).then(function (response) {
        resolve(response);
    }).catch(function (error) {
        reject(error);
    });
}
function post(resolve, reject, url) {
    axios.post(url).then(function (response) {
        resolve(response);
    }).catch(function (error) {
        reject(error);
    });
}

var easyHttpAxios = {
    install: function install(host) {
        host.bindAction("", get);
        host.bindAction("get", get);
        host.bindAction("post", post);
    }
};

module.exports = easyHttpAxios;
