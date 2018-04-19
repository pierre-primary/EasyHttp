/*!
* easy-http-axios.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
import axios from 'axios';

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

export default easyHttpAxios;
