/*!
* easy-http.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('babel-runtime/helpers/toConsumableArray'), require('babel-runtime/helpers/extends'), require('babel-runtime/helpers/classCallCheck'), require('babel-runtime/helpers/createClass'), require('babel-runtime/core-js/json/stringify'), require('babel-runtime/core-js/object/get-prototype-of'), require('babel-runtime/helpers/possibleConstructorReturn'), require('babel-runtime/helpers/inherits'), require('babel-runtime/core-js/promise'), require('babel-runtime/core-js/object/define-property'), require('babel-runtime/core-js/symbol')) :
    typeof define === 'function' && define.amd ? define(['babel-runtime/helpers/toConsumableArray', 'babel-runtime/helpers/extends', 'babel-runtime/helpers/classCallCheck', 'babel-runtime/helpers/createClass', 'babel-runtime/core-js/json/stringify', 'babel-runtime/core-js/object/get-prototype-of', 'babel-runtime/helpers/possibleConstructorReturn', 'babel-runtime/helpers/inherits', 'babel-runtime/core-js/promise', 'babel-runtime/core-js/object/define-property', 'babel-runtime/core-js/symbol'], factory) :
    (global.EasyHttp = factory(global._toConsumableArray,global._extends,global._classCallCheck,global._createClass,global._JSON$stringify,global._Object$getPrototypeOf,global._possibleConstructorReturn,global._inherits,global._Promise,global._Object$defineProperty,global._Symbol));
}(this, (function (_toConsumableArray,_extends,_classCallCheck,_createClass,_JSON$stringify,_Object$getPrototypeOf,_possibleConstructorReturn,_inherits,_Promise,_Object$defineProperty,_Symbol) { 'use strict';

    _toConsumableArray = _toConsumableArray && _toConsumableArray.hasOwnProperty('default') ? _toConsumableArray['default'] : _toConsumableArray;
    _extends = _extends && _extends.hasOwnProperty('default') ? _extends['default'] : _extends;
    _classCallCheck = _classCallCheck && _classCallCheck.hasOwnProperty('default') ? _classCallCheck['default'] : _classCallCheck;
    _createClass = _createClass && _createClass.hasOwnProperty('default') ? _createClass['default'] : _createClass;
    _JSON$stringify = _JSON$stringify && _JSON$stringify.hasOwnProperty('default') ? _JSON$stringify['default'] : _JSON$stringify;
    _Object$getPrototypeOf = _Object$getPrototypeOf && _Object$getPrototypeOf.hasOwnProperty('default') ? _Object$getPrototypeOf['default'] : _Object$getPrototypeOf;
    _possibleConstructorReturn = _possibleConstructorReturn && _possibleConstructorReturn.hasOwnProperty('default') ? _possibleConstructorReturn['default'] : _possibleConstructorReturn;
    _inherits = _inherits && _inherits.hasOwnProperty('default') ? _inherits['default'] : _inherits;
    _Promise = _Promise && _Promise.hasOwnProperty('default') ? _Promise['default'] : _Promise;
    _Object$defineProperty = _Object$defineProperty && _Object$defineProperty.hasOwnProperty('default') ? _Object$defineProperty['default'] : _Object$defineProperty;
    _Symbol = _Symbol && _Symbol.hasOwnProperty('default') ? _Symbol['default'] : _Symbol;

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

    function initD(value) {
        if (value) {
            var dictate = void 0;
            var _dictate = value.split(":");
            _dictate.forEach(function (e) {
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
            value = _JSON$stringify(value);
        }
        return value;
    }

    var Configure = function () {
        function Configure() {
            _classCallCheck(this, Configure);
        }

        _createClass(Configure, [{
            key: "setBaseUrl",
            value: function setBaseUrl(baseUrl) {
                this.baseUrl = baseUrl || "";
                return this;
            }
        }, {
            key: "setHeader",
            value: function setHeader(h) {
                this.h = _extends({}, h);
                return this;
            }
        }, {
            key: "addHeader",
            value: function addHeader(h) {
                this.h = this.h ? _extends({}, this.h, h) : _extends({}, h);
                return this;
            }
        }, {
            key: "bindHandler",
            value: function bindHandler(hd) {
                this.hd = hd;
                return this;
            }
        }, {
            key: "bindPreHandler",
            value: function bindPreHandler() {
                var args = arguments;
                if (args && args.length > 0) {
                    var _prehd;

                    this.prehd || (this.prehd = []);
                    (_prehd = this.prehd).push.apply(_prehd, _toConsumableArray(args));
                }
                return this;
            }
        }, {
            key: "bindPostHandler",
            value: function bindPostHandler() {
                var args = arguments;
                if (args && args.length > 0) {
                    var _posthd;

                    this.posthd || (this.posthd = []);
                    (_posthd = this.posthd).push.apply(_posthd, _toConsumableArray(args));
                }
                return this;
            }

            /**
             *全局绑定自定义命令
             */

        }, {
            key: "bindDictate",
            value: function bindDictate(dName, d) {
                if (dName && d) {
                    this.dm || (this.dm = {});
                    this.dm[dName.toLowerCase()] = d;
                }
                return this;
            }
        }, {
            key: "setAction",
            value: function setAction(a) {
                this.defA = a;
                return this;
            }
        }, {
            key: "setDictate",
            value: function setDictate(d) {
                this.defD = initD(d);
                return this;
            }

            /**
             *绑定序列化处理器
             */

        }, {
            key: "setSerializater",
            value: function setSerializater(sz) {
                this.sz = sz;
                return this;
            }

            /**
             *绑定全局错误处理器
             */

        }, {
            key: "setErrorHandler",
            value: function setErrorHandler(eh) {
                this.eh = eh;
                return this;
            }
        }, {
            key: "setEscape",
            value: function setEscape(esc) {
                this.esc = esc;
                return this;
            }

            /**
             * 插件安装
             */

        }, {
            key: "use",
            value: function use(plugin) {
                if (plugin && plugin.install && is(plugin.install, Function)) {
                    plugin.install(this);
                }
                return this;
            }
        }]);

        return Configure;
    }();


    var Conf = new Configure();

    var UseConfigureImpt = function () {
        function UseConfigureImpt(outConfigure) {
            _classCallCheck(this, UseConfigureImpt);

            this.outConf = outConfigure;
        }

        _createClass(UseConfigureImpt, [{
            key: "dictateMap",
            value: function dictateMap(dName) {
                return this.outConf.dm && this.outConf.dm[dName] || Conf.dm && Conf.dm[dName];
            }
        }, {
            key: "header",
            get: function get() {
                return this.outConf.h || Conf.h;
            }
        }, {
            key: "escape",
            set: function set(value) {
                value && (this.esc = value);
            },
            get: function get() {
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
        }, {
            key: "dictate",
            set: function set(d) {
                this.defD = initD(d);
            },
            get: function get() {
                return this.defD || this.outConf.defD || Conf.defD;
            }
        }, {
            key: "action",
            set: function set(a) {
                this.defA = a;
            },
            get: function get() {
                return (this.defA || this.outConf.defA || Conf.defA || "get").toLowerCase();
            }
        }, {
            key: "baseUrl",
            get: function get() {
                return this.outConf.baseUrl || Conf.baseUrl;
            }
        }, {
            key: "serializater",
            get: function get() {
                return this.outConf.sz || Conf.sz || defSerializater;
            }
        }, {
            key: "errorHandler",
            get: function get() {
                return this.outConf.eh || Conf.eh;
            }
        }, {
            key: "handler",
            get: function get() {
                return this.outConf.hd || Conf.hd;
            }
        }, {
            key: "preHandlers",
            get: function get() {
                return this.outConf.prehd || Conf.prehd;
            }
        }, {
            key: "postHandlers",
            get: function get() {
                return this.outConf.posthd || Conf.posthd;
            }
        }]);

        return UseConfigureImpt;
    }();

    //匹配规则
    var reg = /(?:\[([^[{]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^}\]]*)\])?/gi;

    var HoldBL = "*:hold-bl:*";
    var HoldBR = "*:hold-br:*";
    var HoldML = "*:hold-ml:*";
    var HoldMR = "*:hold-mr:*";
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

    var RequestOption = function (_UseConfigureImpt) {
        _inherits(RequestOption, _UseConfigureImpt);

        function RequestOption(conf, obj) {
            _classCallCheck(this, RequestOption);

            var _this = _possibleConstructorReturn(this, (RequestOption.__proto__ || _Object$getPrototypeOf(RequestOption)).call(this, conf));

            if (obj) {
                if (is(obj, Object)) {
                    (obj.action || obj.a) && (_this.action = obj.action || obj.a);
                    (obj.urlFormat || obj.u) && (_this._urlFormat = obj.urlFormat || obj.u);
                    (obj.escape || obj.esc) && (_this.escape = obj.escape || obj.esc);
                    _this.dictate = obj.dictate || obj.d;
                } else {
                    _this._urlFormat = obj;
                }
            }
            return _this;
        }

        _createClass(RequestOption, [{
            key: "reSetUrlFormat",
            value: function reSetUrlFormat() {
                if (this.escape) {
                    this._urlFormatHold || (this._urlFormatHold = hold(this._urlFormat));
                } else {
                    this._urlFormatHold && delete this._urlFormatHold;
                }
                this.makeMatchsMap();
            }
        }, {
            key: "makeMatchsMap",
            value: function makeMatchsMap() {
                var _this2 = this;

                if (!this.matchsMap || this._matchsUrl !== this.urlFormat) {
                    this.matchsMap = {};
                    this._matchsUrl = this.urlFormat;
                    var result = void 0;

                    var _loop = function _loop() {
                        var matchs = {
                            match: result[0],
                            prefix: result[1],
                            key: result[2],
                            suffix: result[4]
                        };
                        if (result[3]) {
                            var _dictate = result[3].split(":");
                            _dictate.forEach(function (e) {
                                if (e) {
                                    matchs.dictate || (matchs.dictate = new Array());
                                    matchs.dictate.push(e);
                                }
                            });
                        }
                        _this2.matchsMap[matchs.key] = matchs;
                    };

                    while ((result = reg.exec(this._matchsUrl)) != null) {
                        _loop();
                    }
                }
                return this.matchsMap;
            }
        }, {
            key: "recoverUrl",
            value: function recoverUrl(url) {
                if (this._urlFormatHold) {
                    return unHold(url);
                }
                return url;
            }
            /**
             * 参数解析
             */

        }, {
            key: "analysis",
            value: function analysis(data) {
                var _this3 = this;

                this.reSetUrlFormat();
                data || (data = {});
                var query = void 0;
                var urlFormat = this.urlFormat;
                var matchsMap = this.matchsMap;
                if (matchsMap) {
                    for (var key in matchsMap) {
                        if (!(key in data)) {
                            var match = matchsMap[key];
                            urlFormat = urlFormat.replace(match.match, "");
                        }
                    }
                }

                var _loop2 = function _loop2(_key) {
                    var match = matchsMap[_key];
                    var value = data[_key] || "";
                    var szr = _this3.serializater;
                    value = szr(value);
                    var dictate = match && match.dictate || _this3.dictate;
                    if (dictate) {
                        dictate.forEach(function (e) {
                            var dictateHandler = _this3.dictateMap(e);
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
                        query += (query ? "&" : "") + _key + "=" + value;
                    }
                };

                for (var _key in data) {
                    _loop2(_key);
                }

                urlFormat = urlFormat ? this.recoverUrl(urlFormat) : "";
                var url = this.baseUrl + urlFormat;
                if (query) {
                    url += (url.indexOf("?") < 0 ? "?" : "&") + query;
                }
                return url;
            }
        }, {
            key: "urlFormat",
            get: function get() {
                return this._urlFormatHold || this._urlFormat;
            }
        }]);

        return RequestOption;
    }(UseConfigureImpt);

    var Requester = function () {
        function Requester(requestOption) {
            _classCallCheck(this, Requester);

            this.ro = requestOption;
        }

        _createClass(Requester, [{
            key: "createHandler",


            /**
             * 创建请求函数
             */
            value: function createHandler() {
                var $slef = this;
                var handler = function handler(options) {
                    var promise = new _Promise(function (_resolve, _reject) {
                        var url = this.getUrl(options && options.params);
                        var actionName = $slef.ro.action;
                        var request = {
                            url: url,
                            action: actionName,
                            data: options && options.data,
                            header: this.getHeader()
                        };
                        function complete(code, data, header, error) {
                            var response = {
                                code: code,
                                data: data,
                                header: header,
                                error: error
                            };
                            var pohds = $slef.ro.postHandlers;
                            if (pohds && pohds.length > 0) {
                                for (var i = 0, len = pohds.length; i < len; i++) {
                                    if (pohds[i](request, response, _resolve, _reject)) {
                                        return false;
                                    }
                                }
                            }
                            if (response.code > 0) {
                                return _resolve(response);
                            } else {
                                return _reject(response);
                            }
                        }
                        var hd = $slef.ro.handler;
                        if (!hd) {
                            console.warn("EasyHttp-Url: [" + actionName + "]" + url);
                            console.warn("EasyHttp-Warn:", "not found handler", "\n");
                        } else {
                            var prhds = $slef.ro.preHandlers;
                            if (prhds && prhds.length > 0) {
                                for (var i = 0, len = prhds.length; i < len; i++) {
                                    if (prhds[i](request, complete)) {
                                        return;
                                    }
                                }
                            }
                            hd(request, complete);
                            return;
                        }
                    }.bind(handler));
                    return promise;
                };
                handler.setHeader = function (_h) {
                    header = _extends({}, _h);
                    return handler;
                };
                handler.addHeader = function (_h) {
                    header = _extends({}, this.getHeader(), _h);
                    return handler;
                };
                handler.getHeader = function () {
                    return handler.header || $slef.ro.header || {};
                };
                handler.getUrl = function (data) {
                    var url = $slef.ro.analysis(data);
                    return url;
                };
                return handler;
            }
        }, {
            key: "handler",
            get: function get() {
                return this.createHandler();
            }
        }]);

        return Requester;
    }();

    //私有属性名
    var _ref = [_Symbol("requestOptions"), _Symbol("requesters"), _Symbol("configure"), _Symbol("getRequestItem")],
        rqots = _ref[0],
        rqers = _ref[1],
        in_conf = _ref[2],
        getRequestItem = _ref[3];

    var EasyHttp = function () {
        function EasyHttp(baseUrl, requests) {
            _classCallCheck(this, EasyHttp);

            this[in_conf] = new Configure();
            this.setBaseUrl(baseUrl).addRequests(requests);
        }

        _createClass(EasyHttp, [{
            key: getRequestItem,
            value: function value(key) {
                this[rqers] || (this[rqers] = {});
                if (key in this[rqots] && !(key in this[rqers])) {
                    this[rqers][key] = new Requester(this[rqots][key]);
                }
                return this[rqers] && this[rqers][key];
            }
        }]);

        return EasyHttp;
    }();

    Object.defineProperty(EasyHttp.prototype, "addRequests", {
        configurable: false,
        enumerable: false,
        get: function get() {
            return function (requests) {
                var _this = this;

                if (requests) {
                    this[rqots] || (this[rqots] = {});

                    var _loop = function _loop(key) {
                        _this[rqots][key] = new RequestOption(_this[in_conf], requests[key]);
                        _Object$defineProperty(_this, key, {
                            get: function get() {
                                var item = this[getRequestItem](key);
                                return item && item.handler;
                            }
                        });
                    };

                    for (var key in requests) {
                        _loop(key);
                    }
                }
                return this;
            }.bind(this);
        }
    });

    /**
     * 对外配置方法注册为静态和非静态两种方式
     */
    var funcs = ["setBaseUrl", "setHeader", "addHeader", "bindHandler", "bindPreHandler", "bindPostHandler", "bindDictate", "setSerializater", "setErrorHandler", "setAction", "setDictate", "setEscape", "use"];

    var n = funcs.length;

    var _loop2 = function _loop2(i) {
        var key = funcs[i];
        _Object$defineProperty(EasyHttp, key, {
            configurable: false,
            enumerable: false,
            get: function get() {
                return function () {
                    Conf[key].apply(Conf, arguments);
                    return this;
                }.bind(this);
            }
        });

        _Object$defineProperty(EasyHttp.prototype, key, {
            configurable: false,
            enumerable: false,
            get: function get() {
                return function () {
                    var _in_conf;

                    (_in_conf = this[in_conf])[key].apply(_in_conf, arguments);
                    return this;
                }.bind(this);
            }
        });
    };

    for (var i = 0; i < n; i++) {
        _loop2(i);
    }

    return EasyHttp;

})));
