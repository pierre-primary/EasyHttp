/*!
* easy-http.js v1.0.1
* (c) 2018-2018 PengYuan-Jiang
*/
'use strict';

/**
 * 判断对象类型 （无法区分Function Is Object）
 *
 * @param {any} value
 * @param {any} type
 * @returns
 */
function is(value, type) {
    // 先处理null和undefined
    if (value == undefined) {
        return value === type;
    }
    // instanceof 判断继承
    return value.constructor === type || value instanceof type;
}

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function initD(value) {
    if (value) {
        let dictate;
        let _dictate = value.split(":");
        _dictate.forEach(e => {
            if (e) {
                dictate || (dictate = new Array());
                dictate.push(e);
            }
        });
        return dictate;
    }
}

function defSerializater(value) {
    if (is(value, Object)) {
        value = JSON.stringify(value);
    }
    return value;
}

//可配置类基类
class Configure {
    setBaseUrl(baseUrl) {
        this.baseUrl = baseUrl || "";
        return this;
    }

    setHeader(h) {
        this.h = h ? _extends({}, h) : null;
        return this;
    }

    addHeader(h) {
        if (!h) {
            return this;
        }
        this.h = this.h ? _extends({}, this.h, h) : _extends({}, h);
        return this;
    }

    bindHandler(hd) {
        this.hd = hd;
        return this;
    }

    bindPreHandler() {
        let args = arguments;
        if (args && args.length > 0) {
            this.prehd || (this.prehd = []);
            this.prehd.push(...args);
        }
        return this;
    }

    bindPostHandler() {
        let args = arguments;
        if (args && args.length > 0) {
            this.posthd || (this.posthd = []);
            this.posthd.push(...args);
        }
        return this;
    }

    /**
     *全局绑定自定义命令
     */
    bindDictate(dName, d) {
        if (dName && d) {
            this.dm || (this.dm = {});
            this.dm[dName.toLowerCase()] = d;
        }
        return this;
    }

    setAction(a) {
        this.defA = a;
        return this;
    }

    setDictate(d) {
        this.defD = initD(d);
        return this;
    }

    /**
     *绑定序列化处理器
     */
    setSerializater(sz) {
        this.sz = sz;
        return this;
    }

    /**
     *绑定全局错误处理器
     */
    setErrorHandler(eh) {
        this.eh = eh;
        return this;
    }

    setEscape(esc) {
        this.esc = esc;
        return this;
    }

    /**
     * 插件安装
     */
    use(plugin) {
        plugin.install(this);
        return this;
    }
}

const Conf = new Configure();

//配置调用辅助基类
class UseConfigureImpt {
    constructor(outConfigure) {
        this.outConf = outConfigure;
    }

    get header() {
        let h = this.outConf.h || Conf.h;
        return h ? _extends({}, h) : {};
    }

    set escape(value) {
        value && (this.esc = value);
    }

    get escape() {
        if (this.esc != undefined) {
            return this.esc;
        }
        if (this.outConf.esc != undefined) {
            return this.outConf.esc;
        }
        if (Conf.esc != undefined) {
            return Conf.esc;
        }
        return false;
    }

    set dictate(d) {
        this.defD = initD(d);
    }

    get dictate() {
        return this.defD || this.outConf.defD || Conf.defD;
    }

    set action(a) {
        this.defA = a;
    }

    get action() {
        return (this.defA || this.outConf.defA || Conf.defA || "get").toLowerCase();
    }

    get baseUrl() {
        return this.outConf.baseUrl || Conf.baseUrl;
    }

    get serializater() {
        return this.outConf.sz || Conf.sz || defSerializater;
    }

    get errorHandler() {
        return this.outConf.eh || Conf.eh;
    }

    get handler() {
        return this.outConf.hd || Conf.hd;
    }

    get preHandlers() {
        return this.outConf.prehd || Conf.prehd;
    }

    get postHandlers() {
        return this.outConf.posthd || Conf.posthd;
    }

    dictateMap(dName) {
        return this.outConf.dm && this.outConf.dm[dName] || Conf.dm && Conf.dm[dName];
    }
}

//匹配规则
const reg = /(?:\[([^[{]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^}\]]*)\])?/gi;

const HoldBL = "*:hold-bl:*";
const HoldBR = "*:hold-br:*";
const HoldML = "*:hold-ml:*";
const HoldMR = "*:hold-mr:*";

function hold(str) {
    if (!str) {
        return str;
    }
    return str.replace("\\{", HoldBL).replace("\\}", HoldBR).replace("\\[", HoldML).replace("\\]", HoldMR);
}

function unHold(str) {
    if (!str) {
        return str;
    }
    return str.replace(HoldBL, "{").replace(HoldBR, "}").replace(HoldML, "[").replace(HoldMR, "]");
}

class RequestOption extends UseConfigureImpt {
    constructor(conf, obj) {
        super(conf);
        if (obj) {
            if (is(obj, Object)) {
                (obj.action || obj.a) && (this.action = obj.action || obj.a);
                (obj.urlFormat || obj.u) && (this._urlFormat = obj.urlFormat || obj.u);
                (obj.escape || obj.esc) && (this.escape = obj.escape || obj.esc);
                this.dictate = obj.dictate || obj.d;
            } else {
                this._urlFormat = obj;
            }
        }
    }

    get urlFormat() {
        return this._urlFormatHold || this._urlFormat;
    }

    reSetUrlFormat() {
        if (this.escape) {
            this._urlFormatHold || (this._urlFormatHold = hold(this._urlFormat));
        } else {
            this._urlFormatHold && delete this._urlFormatHold;
        }
        this.makeMatchsMap();
    }

    makeMatchsMap() {
        if (!this.matchsMap || this._matchsUrl !== this.urlFormat) {
            this.matchsMap = {};
            this._matchsUrl = this.urlFormat;
            let result;
            while ((result = reg.exec(this._matchsUrl)) != null) {
                let matchs = {
                    match: result[0],
                    prefix: result[1],
                    key: result[2],
                    suffix: result[4]
                };
                if (result[3]) {
                    let _dictate = result[3].split(":");
                    _dictate.forEach(e => {
                        if (e) {
                            matchs.dictate || (matchs.dictate = new Array());
                            matchs.dictate.push(e);
                        }
                    });
                }
                this.matchsMap[matchs.key] = matchs;
            }
        }
        return this.matchsMap;
    }

    recoverUrl(url) {
        if (this._urlFormatHold) {
            return unHold(url);
        }
        return url;
    }
    /**
     * 参数解析
     */
    analysis(data) {
        this.reSetUrlFormat();
        data || (data = {});
        let query;
        let urlFormat = this.urlFormat;
        let matchsMap = this.matchsMap;
        if (matchsMap) {
            for (let key in matchsMap) {
                if (!(key in data)) {
                    let match = matchsMap[key];
                    urlFormat = urlFormat.replace(match.match, "");
                }
            }
        }
        for (let key in data) {
            let match = matchsMap[key];
            let value = data[key];
            let szr = this.serializater;
            value = szr(value);
            let dictate = match && match.dictate || this.dictate;
            if (dictate) {
                dictate.forEach(e => {
                    let dictateHandler = this.dictateMap(e);
                    if (dictateHandler) {
                        value = dictateHandler(value);
                    }
                });
            }
            let isIv = value === undefined; //无效
            if (match) {
                if (isIv) {
                    value = "";
                } else {
                    value = (match.prefix || "") + value + (match.suffix || "");
                }
                urlFormat = urlFormat.replace(match.match, value);
            } else {
                isIv && (value = "");
                query || (query = "");
                query += (query ? "&" : "") + key + "=" + value;
            }
        }

        urlFormat = urlFormat ? this.recoverUrl(urlFormat) : "";
        let url = this.baseUrl + urlFormat;
        if (query) {
            url += (url.indexOf("?") < 0 ? "?" : "&") + query;
        }
        return url;
    }
}

var _extends$1 = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

class Requester {
    constructor(requestOption) {
        this.ro = requestOption;
    }

    get handler() {
        return this.createHandler();
    }

    /**
     * 创建请求函数
     */
    createHandler() {
        let $slef = this;
        let header;
        let handler = function (options) {
            let promise = new Promise((resolve, reject) => {
                let url = handler.getUrl(options && options.params);
                let actionName = $slef.ro.action;
                let request = {
                    url,
                    params: options && options.params,
                    action: actionName,
                    data: options && options.data,
                    other: options && options.other,
                    header: options.header ? _extends$1({}, handler.getHeader(), options.header) : handler.getHeader()
                };
                let hd = $slef.ro.handler;
                if (hd) {
                    let prhds = $slef.ro.preHandlers;
                    if (prhds && prhds.length > 0) {
                        for (let i = 0, len = prhds.length; i < len; i++) {
                            if (prhds[i](request, resolve, reject)) {
                                return;
                            }
                        }
                    }
                    try {
                        hd(request).then(resp => {
                            resolve({
                                request,
                                response: resp
                            });
                        }).catch(resp => {
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
            let pohds = $slef.ro.postHandlers;
            if (pohds && pohds.length > 0) {
                return Promise.resolve().then(() => {
                    let _p = promise;
                    for (let i = 0, len = pohds.length; i < len; i++) {
                        _p = pohds[i](_p);
                    }
                    return _p;
                });
            } else {
                return promise;
            }
        };
        handler.setHeader = function (h) {
            header = h ? _extends$1({}, h) : null;
            return handler;
        };
        handler.addHeader = function (h) {
            if (!h) {
                return handler;
            }
            header = _extends$1({}, this.getHeader(), h);
            return handler;
        };
        handler.getHeader = function () {
            return header || $slef.ro.header;
        };
        handler.getUrl = function (data) {
            let url = $slef.ro.analysis(data);
            return url;
        };
        return handler;
    }
}

//私有属性名
const [rqots, rqers, in_conf, getRequestItem] = [Symbol("requestOptions"), Symbol("requesters"), Symbol("configure"), Symbol("getRequestItem")];

class EasyHttp {
    constructor(baseUrl, requests) {
        this[in_conf] = new Configure();
        this.setBaseUrl(baseUrl).addRequests(requests);
    }

    [getRequestItem](key) {
        this[rqers] || (this[rqers] = {});
        if (key in this[rqots] && !(key in this[rqers])) {
            this[rqers][key] = new Requester(this[rqots][key]);
        }
        return this[rqers] && this[rqers][key];
    }
}

Object.defineProperty(EasyHttp.prototype, "addRequests", {
    configurable: false,
    enumerable: false,
    get: function () {
        return function (requests) {
            if (requests) {
                this[rqots] || (this[rqots] = {});
                for (let key in requests) {
                    this[rqots][key] = new RequestOption(this[in_conf], requests[key]);
                    Object.defineProperty(this, key, {
                        get: function () {
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
const funcs = ["setBaseUrl", "setHeader", "addHeader", "bindHandler", "bindPreHandler", "bindPostHandler", "bindDictate", "setSerializater", "setErrorHandler", "setAction", "setDictate", "setEscape", "use"];

const n = funcs.length;
for (let i = 0; i < n; i++) {
    let key = funcs[i];
    Object.defineProperty(EasyHttp, key, {
        configurable: false,
        enumerable: false,
        get: function () {
            return function () {
                Conf[key](...arguments);
                return this;
            }.bind(this);
        }
    });

    Object.defineProperty(EasyHttp.prototype, key, {
        configurable: false,
        enumerable: false,
        get: function () {
            return function () {
                this[in_conf][key](...arguments);
                return this;
            }.bind(this);
        }
    });
}

module.exports = EasyHttp;
