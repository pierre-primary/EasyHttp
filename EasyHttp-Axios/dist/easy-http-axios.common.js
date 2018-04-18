/*!
* easy-http-axios.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var EasyHttp = _interopDefault(require('easy-http'));
var axios = _interopDefault(require('axios'));

EasyHttp.bindAction("", function (resolve, reject, url) {
    axios.get(url).then(function (response) {
        resolve(response.data);
    }).catch(function (error) {
        reject(error);
    });
});
EasyHttp.bindAction("get", function (resolve, reject, url) {
    axios.get(url).then(function (response) {
        resolve(response);
    }).catch(function (error) {
        reject(error);
    });
});
EasyHttp.bindAction("post", function (resolve, reject, url) {
    axios.post(url).then(function (response) {
        resolve(response);
    }).catch(function (error) {
        reject(error);
    });
});

//
var ggg = new EasyHttp("http://test.com", {
    gg: null,
    gg2: "/{a}/{b:j:u:b}/[act/{c:hhh}/act/]",
    gg3: "/haha?[a={a}][&b={b}][&c={c}]"
});
console.log(ggg.gg3.getUrl({ a: { gg: { gg: "" } }, b: 2, c: 3 }));
var i = ggg.gg2({ a: 1, b: 2, c: 3 }).then(function (e) {
    // console.log(e);
}).catch(function (e) {
    // console.log(e);
});
i = ggg.gg().then(function (e) {
    // console.log(e);
}).catch(function (e) {
    // console.log(e);
});
i = ggg.gg3({ a: 1, b: 2, c: 3 }).then(function (e) {
    // console.log(e);
}).catch(function (e) {
    // console.log(e);
});
