const EasyHttp = require("../dist/easy-http.common");
const axios = require("axios");

let ii = 0;
EasyHttp.setRequestHandler(request => {
    return axios({
        method: request.method,
        url: request.url,
        data: request.data,
        headers: request.headers
    });
})
    .setHeaders({
        1: "0",
        2: "0"
    })
    .addHeaders({
        2: "1",
        3: "1"
    })
    .addDictateHandler({
        b: e => {
            return e + 55;
        }
    })
    .addInterceptor((request, proceed) => {
        //拦截request
        request.headers["Test"] = "Test";
        console.log(request);

        return proceed(request).then(e => {
            return e;
        });
    });

let eh = new EasyHttp();
eh.setBaseUrl("http://www.baidu.com");

eh.addRequests({
    Test: "{?test={test:b}}"
});

eh.Test({
    params: { test: 0 },
    headers: {
        4: "3",
        5: "3"
    },
    coverHeaders: true,
    extraData: { haha: "gfdgdfg" }
}).then(e => {});

eh.request({
    url: "http://www.baidu.com"
});
