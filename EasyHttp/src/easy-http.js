import RequestOption from "./request-option";
import Requester from "./requester";
import Conf, { ConfigureGetter } from "./configure";

//私有属性名
const [rqots, rqers, conf, getRequestItem] = [
    Symbol("requestOptions"),
    Symbol("requesters"),
    Symbol("configure"),
    Symbol("getRequestItem")
];

class EasyHttp {
    constructor(baseUrl, requests) {
        this[conf] = new ConfigureGetter();
        this.setBaseUrl(baseUrl).addRequests(requests);
    }

    [getRequestItem](key) {
        this[rqers] || (this[rqers] = {});
        if (key in this[rqots] && !(key in this[rqers])) {
            this[rqers][key] = new Requester(this[rqots][key]);
        }
        return this[rqers] && this[rqers][key];
    }
    /**
     * 创建请求函数
     */
    createHandler(reqOpt) {
        let conf = this[conf].configureGetter;
        let header;
        let handler = function(req) {
            let promise = new Promise((resolve, reject) => {
                let request = {
                    url: handler.getUrl(req && req.params),
                    params: req && req.params,
                    action: reqOpt.action,
                    data: req && req.data,
                    other: req && req.other,
                    header: req.header ? { ...handler.getHeaders(), ...req.header } : handler.getHeaders()
                };
                let requestHandler = conf.requestHandler;
                if (requestHandler) {
                    let preInterceptors = conf.preInterceptors;
                    if (preInterceptors && preInterceptors.length > 0) {
                        for (let i = 0, len = preInterceptors.length; i < len; i++) {
                            if (preInterceptors[i](request, resolve, reject)) {
                                return;
                            }
                        }
                    }
                    try {
                        requestHandler(request)
                            .then(resp => {
                                resolve({
                                    request,
                                    response: resp
                                });
                            })
                            .catch(resp => {
                                reject({
                                    errType: 0,
                                    request,
                                    response: resp
                                });
                            });
                    } catch (e) {
                        reject({
                            errType: -1,
                            request,
                            msg: e
                        });
                    }
                } else {
                    reject({
                        errType: -1,
                        request,
                        msg: "not found handler"
                    });
                }
            });
            let postInterceptors = conf.postInterceptors;
            if (postInterceptors && postInterceptors.length > 0) {
                return Promise.resolve().then(() => {
                    let _p = promise;
                    for (let i = 0, len = postInterceptors.length; i < len; i++) {
                        _p = postInterceptors[i](_p);
                    }
                    return _p;
                });
            } else {
                return promise;
            }
        };
        handler.setHeaders = function(h) {
            header = h ? { ...h } : null;
            return handler;
        };
        handler.addHeaders = function(h) {
            if (!h) {
                return handler;
            }
            header = { ...this.getHeaders(), ...h };
            return handler;
        };
        handler.getHeaders = function() {
            return header || reqOpt.header;
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
            if (requests) {
                this[rqots] || (this[rqots] = {});
                for (let key in requests) {
                    this[rqots][key] = new RequestOption(this[in_conf].configureGetter, requests[key]);
                    Object.defineProperty(this, key, {
                        get: function() {
                            let item = this[getRequestItem](key);
                            return item && item.handler;
                        }
                    });
                }
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
    "setAction",
    "setDictate",
    "setHeaders",
    "addHeaders",
    "removeHeaders",
    "setRequestHandler",
    "setPreInterceptor",
    "addPreInterceptor",
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
                this[in_conf][key](...arguments);
                return this;
            }.bind(this);
        }
    });
}
export default EasyHttp;
