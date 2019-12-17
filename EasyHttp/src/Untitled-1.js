class EasyHttp {
    constructor(config) {

    }
    init(config) {

    }
}

const axios = require("axios")
axios.interceptors.request.use(function () {

});

var a = axios.create({
    headers: { "Content-Type": "fsdfdsf",gggg:{ "Content-Type": "fsdfdsf"} },
    gggg: "",
    adapter: function (config) {
        return config;
    }
    // transformRequest :[function (data) {
    //     // `transformRequest` 允许在向服务器发送前，修改请求数据
    //     // 只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法
    //     data.sex = 'man'
    //     return qs.stringify(data)
    //     // 结合create_headers里的内容，在这里又新增一条信息sex=man
    //     // 因此network中查看的结果是：name=xiaoming&age=12&sex=man
    // }]
})

// a.interceptors.request.use(function (config) {
//     // Do something before request is sent
//     return config;
// }, function (error) {
//     // Do something with request error
//     return Promise.reject(error);
// });
// // console.log(axios.defaults);
console.log(a.defaults);

// a.get("www.baidu.com")
