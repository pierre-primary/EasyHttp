const EasyHttp = require("../dist/easy-http.common");
const axios = require("axios");

let eh = new EasyHttp();
eh.setBaseUrl("http://www.baidu.com");
let ii = 0;
eh.setRequestHandler(request => {
    return axios({
        method: request.method,
        url: request.url,
        data: request.data,
        headers: request.headers
    });
});

eh.addInterceptor((request, proceed) => {
    //拦截request
    request.headers["Test"] = "Test";
    console.log(request);

    return proceed(request).then(e => {
        return e;
    });
});

eh.addRequests({
    Test: "[?test={test:b}]"
});

eh.Test().then(e => {});
