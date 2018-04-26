/*!
* easy-http.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
import _classCallCheck from 'babel-runtime/helpers/classCallCheck';
import _createClass from 'babel-runtime/helpers/createClass';
import _Object$getPrototypeOf from 'babel-runtime/core-js/object/get-prototype-of';
import _possibleConstructorReturn from 'babel-runtime/helpers/possibleConstructorReturn';
import _inherits from 'babel-runtime/helpers/inherits';
import _JSON$stringify from 'babel-runtime/core-js/json/stringify';
import _toConsumableArray from 'babel-runtime/helpers/toConsumableArray';
import _Promise from 'babel-runtime/core-js/promise';
import _Object$defineProperty from 'babel-runtime/core-js/object/define-property';
import _Symbol from 'babel-runtime/core-js/symbol';

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
        /**
         *全局绑定事件 GET,POST 等
         */

    }, {
        key: "bindAction",
        value: function bindAction(aName, a) {
            if (aName && a) {
                this.am || (this.am = {});
                this.am[aName.toLowerCase()] = a;
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
        key: "actionMap",
        value: function actionMap(aName) {
            return this.outConf.am && this.outConf.am[aName] || Conf.am && Conf.am[aName];
        }
    }, {
        key: "dictateMap",
        value: function dictateMap(dName) {
            return this.outConf.dm && this.outConf.dm[dName] || Conf.dm && Conf.dm[dName];
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
            return this.outConf.sz || Conf.sz;
        }
    }, {
        key: "errorHandler",
        get: function get() {
            return this.outConf.eh || Conf.eh;
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

function defSerializater(value) {
    if (is(value, Object)) {
        value = _JSON$stringify(value);
    }
    return value;
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
                var szr = _this3.serializater || defSerializater;
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

var Logger = {
    i: function i(key) {
        var _console;

        for (var _len = arguments.length, str = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            str[_key - 1] = arguments[_key];
        }

        (_console = console).log.apply(_console, [key + ":"].concat(_toConsumableArray(str)));
    },
    d: function d(key) {
        var _console2;

        for (var _len2 = arguments.length, str = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
            str[_key2 - 1] = arguments[_key2];
        }

        (_console2 = console).debug.apply(_console2, [key + ":"].concat(_toConsumableArray(str)));
    },
    w: function w(key) {
        var _console3;

        for (var _len3 = arguments.length, str = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
            str[_key3 - 1] = arguments[_key3];
        }

        (_console3 = console).warn.apply(_console3, [key + ":"].concat(_toConsumableArray(str)));
    },
    e: function e(key) {
        var _console4;

        for (var _len4 = arguments.length, str = Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
            str[_key4 - 1] = arguments[_key4];
        }

        (_console4 = console).error.apply(_console4, [key + ":"].concat(_toConsumableArray(str)));
    }
};

function defErrorHandler(reason) {
    Logger.e("EasyHttp-ResponseError", reason && reason.toString() || reason);
}

var Requester = function (_UseConfigureImpt) {
    _inherits(Requester, _UseConfigureImpt);

    function Requester(conf, requestOption) {
        _classCallCheck(this, Requester);

        var _this = _possibleConstructorReturn(this, (Requester.__proto__ || _Object$getPrototypeOf(Requester)).call(this, conf));

        _this.ro = requestOption;
        return _this;
    }

    _createClass(Requester, [{
        key: "createHandler",


        /**
         * 创建请求函数
         */
        value: function createHandler() {
            var parentObj = this;
            var handler = function handler(options) {
                var promise = new _Promise(function (_resolve, _reject) {
                    function resolve(value) {
                        Logger.i("\nEasyHttp-Response", value && value.data != undefined && value.data || value);
                        return _resolve(value);
                    }
                    function reject(reason) {
                        if (options && options.handleCatch) {
                            return _reject(reason);
                        } else {
                            var eHandler = parentObj.errorHandler || defErrorHandler;
                            return eHandler(reason);
                        }
                    }
                    var url = this.getUrl(options && options.params);
                    var actionName = parentObj.ro.action;
                    Logger.i("EasyHttp-Url", actionName + ":" + url);
                    var action = parentObj.actionMap(actionName);
                    if (!action) {
                        var msg = actionName ? "not found the action:'" + actionName + "'" : "not found default action";
                        Logger.w("EasyHttp", msg);
                    } else if (!is(action, Function)) {
                        var _msg = actionName ? "the action:'" + actionName + "' is not Function" : "default action is not Function";
                        Logger.w("EasyHttp", _msg);
                    } else {
                        action(resolve, reject, url);
                    }
                }.bind(handler));
                return promise;
            };
            handler.getUrl = function (data) {
                var url = parentObj.ro.analysis(data);
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
}(UseConfigureImpt);

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
                this[rqers][key] = new Requester(this[in_conf], this[rqots][key]);
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
var funcs = ["setBaseUrl", "bindAction", "bindDictate", "setSerializater", "setErrorHandler", "setAction", "setDictate", "setEscape", "use"];

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

export default EasyHttp;
