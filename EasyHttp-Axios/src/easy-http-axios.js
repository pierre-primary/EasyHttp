import EasyHttp from "easy-http";
import axios from "axios";

EasyHttp.bindAction("", (resolve, reject, url) => {
    axios
        .get(url)
        .then(function(response) {
            resolve(response.data);
        })
        .catch(function(error) {
            reject(error);
        });
});
EasyHttp.bindAction("get", (resolve, reject, url) => {
    axios
        .get(url)
        .then(function(response) {
            resolve(response);
        })
        .catch(function(error) {
            reject(error);
        });
});
EasyHttp.bindAction("post", (resolve, reject, url) => {
    axios
        .post(url)
        .then(function(response) {
            resolve(response);
        })
        .catch(function(error) {
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
var i = ggg
    .gg2({ a: 1, b: 2, c: 3 })
    .then(e => {
        // console.log(e);
    })
    .catch(e => {
        // console.log(e);
    });
i = ggg
    .gg()
    .then(e => {
        // console.log(e);
    })
    .catch(e => {
        // console.log(e);
    });
i = ggg
    .gg3({ a: 1, b: 2, c: 3 })
    .then(e => {
        // console.log(e);
    })
    .catch(e => {
        // console.log(e);
    });
