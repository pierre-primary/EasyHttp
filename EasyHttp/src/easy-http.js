import RequestOption from "./request-option";
import Chain from "./chain";
import Conf, { ConfigureGetter } from "./configure";

const EmptyArr = [];
const EmptyObj = [];

const pri = Symbol("privateScope");

class EasyHttp {
    constructor(baseUrl, requests) {
        this[pri] = { conf: new ConfigureGetter() };
        this.setBaseUrl(baseUrl).addRequests(requests);
    }

    //发起请求
    request(req) {
        let conf = this[pri].conf.getter;
        let requestHandler = conf.requestHandler;
        let interceptors = [
            //拦截器
            ...(conf.interceptors || EmptyArr),
            //最后一个拦截器必须是请求处理
            request => {
                return requestHandler(request);
            }
        ];

        let chain = new Chain(interceptors);

        let headers;
        if (req.coverHeaders) {
            headers = req.headers || EmptyObj;
        } else {
            headers = { ...(conf.headers || EmptyObj), ...(req.headers || EmptyObj) };
        }

        return chain.proceed({
            url: req.url,
            method: req.method,
            data: req.data,
            headers: headers,
            extraData: req.extraData
        });
    }
    /**
     * 创建请求函数
     */
    createHandler(reqOpt) {
        let _headers;
        let _coverHeaders;
        let handler = req => {
            let url, method, data, headers, coverHeaders, extraData;
            method = reqOpt.method;
            if (req) {
                url = handler.getUrl(req.params);
                data = req.data;
                headers = req.headers || _headers;
                coverHeaders = req.coverHeaders || _coverHeaders;
                extraData = req.extraData;
            } else {
                url = handler.getUrl();
                headers = _headers;
                coverHeaders = _coverHeaders;
            }
            return this.request({
                url: url,
                method: method,
                data: data,
                headers: headers,
                coverHeaders: coverHeaders || false,
                extraData: extraData
            });
        };
        handler.getUrl = function(data) {
            let url = reqOpt.createUrl(data);
            return url;
        };
        return handler;
    }
}

Object.defineProperty(EasyHttp.prototype, "addRequests", {
    configurable: false,
    enumerable: false,
    get: function() {
        return function(requests) {
            if (!requests) {
                return this;
            }
            for (let key in requests) {
                let reqOpt = new RequestOption(this[pri].conf.getter, requests[key]);
                Object.defineProperty(this, key, {
                    get: function() {
                        return this.createHandler(reqOpt);
                    }
                });
            }
            return this;
        }.bind(this);
    }
});

/**
 * 对外配置方法注册为静态和非静态两种方式
 */
const funcs = [
    "init",
    "setBaseUrl",
    "setDefaultMethod",
    "setDictate",
    "setHeaders",
    "addHeaders",
    "removeHeaders",
    "setRequestHandler",
    "setInterceptor",
    "addInterceptor",
    "setDictateHandler",
    "addDictateHandler",
    "removeDictateHandler",
    "setSerializater"
];

const n = funcs.length;
for (let i = 0; i < n; i++) {
    let key = funcs[i];
    Object.defineProperty(EasyHttp, key, {
        configurable: false,
        enumerable: false,
        get: function() {
            return function() {
                Conf[key](...arguments);
                return this;
            }.bind(this);
        }
    });

    Object.defineProperty(EasyHttp.prototype, key, {
        configurable: false,
        enumerable: false,
        get: function() {
            return function() {
                this[pri].conf[key](...arguments);
                return this;
            }.bind(this);
        }
    });
}
export default EasyHttp;
