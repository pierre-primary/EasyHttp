/*!
* easy-http.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.EasyHttp = factory());
}(this, (function () { 'use strict';

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

    class Configure {
        setBaseUrl(baseUrl) {
            this.baseUrl = baseUrl || "";
            return this;
        }

        setHeaders(h) {
            this.h = _extends({}, h);
            return this;
        }

        addHeaders(h) {
            this.h = this.h ? _extends({}, this.h, h) : _extends({}, h);
            return this;
        }

        setHandler(hd) {
            this.hd = hd;
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
            if (plugin && plugin.install && is(plugin.install, Function)) {
                plugin.install(this);
            }
            return this;
        }
    }

    const Conf = new Configure();

    class UseConfigureImpt {
        constructor(outConfigure) {
            this.outConf = outConfigure;
        }

        get headers() {
            return this.outConf.h || {};
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
                let value = data[key] || "";
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
                if (match) {
                    if (value) {
                        value = (match.prefix || "") + value + (match.suffix || "");
                    } else {
                        value = "";
                    }
                    urlFormat = urlFormat.replace(match.match, value);
                } else {
                    value || (value = "");
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
            let handler = function (options) {
                let promise = new Promise(function (_resolve, _reject) {
                    let url = this.getUrl(options && options.params);
                    let actionName = $slef.ro.action;
                    function resolve(value) {
                        console.log(`EasyHttp-Url: [${actionName}]${url}`);
                        console.log("EasyHttp-Respons: ", value && value.data != undefined && value.data || value, "\n");
                        return _resolve(value);
                    }
                    function reject(reason) {
                        if (options && options.handleCatch) {
                            return _reject(reason);
                        } else if ($slef.ro.errorHandler) {
                            return $slef.ro.errorHandler(reason);
                        } else {
                            console.error(`EasyHttp-Url: [${actionName}]${url}`);
                            console.error("EasyHttp-ResponseError: ", reason && reason.toString() || reason, "\n");
                        }
                    }
                    let hd = $slef.ro.handler;
                    if (!hd) {
                        console.warn(`EasyHttp-Url: [${actionName}]${url}`);
                        console.warn("EasyHttp-Warn:", "not found handler", "\n");
                    } else {
                        hd({
                            resolve,
                            reject,
                            url,
                            action: actionName,
                            datas: options.datas,
                            handler: this.getHeaders()
                        });
                    }
                }.bind(handler));
                return promise;
            };
            handler.setHeaders = function (_h) {
                headers = _h;
                return handler;
            };
            handler.addHeaders = function (_h) {
                headers = _extends$1({}, this.getHeaders(), _h);
                return handler;
            };
            handler.getHeaders = function () {
                return handler.headers || $slef.ro.headers || {};
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
    const funcs = ["setBaseUrl", "setHeaders", "addHeaders", "setHandler", "bindDictate", "setSerializater", "setErrorHandler", "setAction", "setDictate", "setEscape", "use"];

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

    return EasyHttp;

})));
