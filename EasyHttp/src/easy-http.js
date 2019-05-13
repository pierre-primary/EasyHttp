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

        return chain.proceed({
            url: req.url,
            method: req.method,
            data: req.data,
            headers: { ...(conf.headers || EmptyObj), ...(req.headers || EmptyObj) },
            extraData: req.extraData
        });
    }
    /**
     * 创建请求函数
     */
    createHandler(reqOpt) {
        let _headers;
        let handler = req => {
            let url, method, data, headers, extraData;
            method = reqOpt.method;
            headers = _headers;
            if (req) {
                url = handler.getUrl(req.params);
                data = req.data;
                if (req.headers) {
                    headers = headers ? { ...headers, ...req.headers } : req.headers;
                }
                extraData = req.extraData;
            } else {
                url = handler.getUrl();
            }
            return this.request({
                url: url,
                method: method,
                data: data,
                headers: headers,
                extraData: extraData
            });
        };
        handler.setHeaders = function(h) {
            _headers = h;
            return handler;
        };
        handler.addHeaders = function(h) {
            if (!h) {
                return handler;
            }
            _headers = { ...(_headers || EmptyObj), ...h };
            return handler;
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
    "setPostInterceptor",
    "addPostInterceptor",
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
