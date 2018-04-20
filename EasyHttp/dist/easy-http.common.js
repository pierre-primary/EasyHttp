/*!
* easy-http.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
'use strict';

var Logger = {
    i: function i(key, str) {
        console.log(key + ":", str);
    },
    d: function d(key, str) {
        console.debug(key + ":", str);
    },
    w: function w(key, str) {
        console.warn(key + ":", str);
    },
    e: function e(key, str) {
        console.error(key + ":", str);
    }
};

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//匹配规则
var reg = /(?:\[([^[{]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^}\]]*)\])?/gi;

//私有属性名
var _ref = [Symbol("createSrc"), Symbol("getRequestItem"), Symbol("createRequestItem"), Symbol("createHandler"), Symbol("analysis"), Symbol("baseUrl"), Symbol("src"), Symbol("requests"), Symbol("dictateMap"), Symbol("actionMap"), Symbol("serializater"), Symbol("processors"), Symbol("errorHandler"), Symbol("logConfig"), Symbol("isHold")],
    createSrc = _ref[0],
    getRequestItem = _ref[1],
    createRequestItem = _ref[2],
    createHandler = _ref[3],
    analysis = _ref[4],
    baseUrl = _ref[5],
    src = _ref[6],
    requests = _ref[7],
    dictateMap = _ref[8],
    actionMap = _ref[9],
    serializater = _ref[10],
    processors = _ref[11],
    errorHandler = _ref[12],
    _logConfig2 = _ref[13],
    isHold = _ref[14];
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

function defSerializater(value) {
    if (is(value, Object)) {
        value = JSON.stringify(value);
    }
    return value;
}

function defErrorHandler(reason) {
    Logger.e("EasyHttp-ResponseError", reason && reason.toString() || reason);
}

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

var EasyHttp = function () {
    function EasyHttp(_baseUrl, options) {
        var _this = this;

        _classCallCheck(this, EasyHttp);

        this[baseUrl] = _baseUrl || "";
        if (options) {
            this[src] = {};

            var _loop = function _loop(key) {
                _this[src][key] = _this[createSrc](options[key]);
                Object.defineProperty(_this, key, {
                    get: function get() {
                        var item = this[getRequestItem](key);
                        return item && item.handler;
                    }
                });
            };

            for (var key in options) {
                _loop(key);
            }
        }
    }

    /**
     *生成url模板信息
     *
     * @param {any} obj
     * @returns
     * @memberof EasyHttp
     */


    _createClass(EasyHttp, [{
        key: createSrc,
        value: function value(obj) {
            var src = void 0;
            if (obj && is(obj, Object)) {
                src = {
                    action: obj.action || obj.a,
                    urlFormat: obj.urlFormat || obj.u,
                    isHold: obj.hold || obj.h
                };
                var dictate = obj.dictate || obj.d;
                if (dictate) {
                    var _dictate = dictate.split(":");
                    _dictate.forEach(function (e) {
                        if (e) {
                            src.dictate || (src.dictate = new Array());
                            src.dictate.push(e);
                        }
                    });
                }
            } else {
                src = {
                    urlFormat: obj
                };
            }
            return src;
        }

        /**
         * 获取请求项
         */

    }, {
        key: getRequestItem,
        value: function value(key) {
            this[requests] || (this[requests] = {});
            if (key in this[src] && !(key in this[requests])) {
                this[requests][key] = this[createRequestItem](this[src][key]);
            }
            return this[requests] && this[requests][key];
        }

        /**
         * 创建请求项
         */

    }, {
        key: createRequestItem,
        value: function value(src) {
            var item = {};
            var result = void 0;
            (src.isHold || this[isHold] || EasyHttp[isHold]) && (src.urlFormat = hold(src.urlFormat));

            var _loop2 = function _loop2() {
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
                item.matchsMap || (item.matchsMap = {});
                item.matchsMap[matchs.key] = matchs;
            };

            while ((result = reg.exec(src.urlFormat)) != null) {
                _loop2();
            }
            var parentObj = this;
            Object.defineProperty(item, "handler", {
                get: function get() {
                    return parentObj[createHandler](src, item);
                }
            });
            return item;
        }

        /**
         * 创建请求函数
         */

    }, {
        key: createHandler,
        value: function value(src, item) {
            var parentObj = this;
            var handleCatch = false;
            var handler = function handler(data) {
                var promise = new Promise(function (_resolve, _reject) {
                    function resolve(value) {
                        Logger.i("EasyHttp-Response", value && value.data != undefined && value.data || value);
                        return _resolve(value);
                    }
                    function reject(reason) {
                        if (handleCatch) {
                            return _reject(reason);
                        } else {
                            var eHandler = parentObj[errorHandler] || EasyHttp[errorHandler] || defErrorHandler;
                            return eHandler(reason);
                        }
                    }
                    var url = this.getUrl(data);
                    Logger.i("EasyHttp-Url", url);
                    var actionName = (src.action || "get").toLowerCase();
                    var action = parentObj[actionMap] && parentObj[actionMap][actionName] || EasyHttp[actionMap] && EasyHttp[actionMap][actionName];
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
            Object.defineProperty(handler, "getUrl", {
                get: function get() {
                    return function (data) {
                        var qStr = parentObj[analysis](src, item.matchsMap, data);
                        var url = parentObj[baseUrl] + qStr;
                        return url;
                    };
                }
            });
            Object.defineProperty(handler, "header", {
                get: function get() {
                    return function (header) {
                        handler.header = header;
                        return handler;
                    };
                }
            });
            Object.defineProperty(handler, "catch", {
                get: function get() {
                    return function (_handleCatch) {
                        handleCatch = _handleCatch;
                        return handler;
                    };
                }
            });
            return handler;
        }

        /**
         * 参数解析
         */

    }, {
        key: analysis,
        value: function (_value) {
            function value(_x, _x2, _x3) {
                return _value.apply(this, arguments);
            }

            value.toString = function () {
                return _value.toString();
            };

            return value;
        }(function (src, matchsMap, data) {
            var _this2 = this;

            var urlFormat = src.urlFormat;
            var query = "";
            data || (data = {});
            matchsMap || (matchsMap = {});

            var _loop3 = function _loop3(key) {
                var match = matchsMap[key];
                var value = data[key] || "";
                var szr = _this2[serializater] || EasyHttp[serializater] || defSerializater;
                value = szr(value);
                var dictate = match && match.dictate || src.dictate;
                if (dictate) {
                    dictate.forEach(function (e) {
                        var dictateHandler = _this2[dictateMap] && _this2[dictateMap][e] || EasyHttp[dictateMap] && EasyHttp[dictateMap][e];
                        if (dictateHandler) {
                            value = dictateHandler(value);
                        }
                    });
                } else {
                    var prs = _this2[processors] || EasyHttp[processors];
                    if (prs) {
                        prs.forEach(function (p) {
                            value = p(value);
                        });
                    }
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
                    query += (query ? "&" : "?") + key + "=" + value;
                }
            };

            for (var key in data) {
                _loop3(key);
            }
            if (matchsMap) {
                for (var key in matchsMap) {
                    if (!(key in data)) {
                        var _match = matchsMap[key];
                        urlFormat = urlFormat.replace(_match.match, value);
                    }
                }
            }
            urlFormat += query;
            urlFormat || (urlFormat = "");
            return src.isHold || this[isHold] || EasyHttp[isHold] ? unHold(urlFormat) : urlFormat;
        })
    }], [{
        key: "logConfig",
        value: function logConfig(_logConfig) {
            this[_logConfig2] = _logConfig;
        }
    }]);

    return EasyHttp;
}();

/**
 * 外部配置方法
 */


var funcs = {
    /**
     *全局绑定事件 GET,POST 等
     */
    bindAction: function bindAction(actionName, action) {
        actionName || (actionName = "");
        this[actionMap] || (this[actionMap] = {});
        if (!action) {
            return;
        }
        this[actionMap][actionName.toLowerCase()] = action;
        return this;
    },

    /**
     *全局绑定自定义命令
     */
    bindDictate: function bindDictate(dictate, handler) {
        this[dictateMap] || (this[dictateMap] = {});
        if (!dictate || !handler) {
            return;
        }
        this[dictateMap][dictate.toLowerCase()] = handler;
        return this;
    },

    /**
     *绑定序列化处理器
     */
    setSerializater: function setSerializater(_serializater) {
        this[serializater] = _serializater;
        return this;
    },

    /**
     *绑定全局错误处理器
     */
    setErrorHandler: function setErrorHandler(_errorHandler) {
        this[errorHandler] = _errorHandler;
        return this;
    },

    setIsHold: function setIsHold(_isHold) {
        this[isHold] = _isHold;
        return this;
    },
    /**
     *添加参数预处理器
     */
    addProcessor: function addProcessor() {
        var _processors2;

        for (var _len = arguments.length, _processors = Array(_len), _key = 0; _key < _len; _key++) {
            _processors[_key] = arguments[_key];
        }

        this[processors] || (this[processors] = new Array());
        if (!_processors) {
            return;
        }
        (_processors2 = this[processors]).push.apply(_processors2, _processors);
        return this;
    },
    /**
     * 插件安装
     */
    use: function use(plugin) {
        if (plugin && plugin.install && is(plugin.install, Function)) {
            plugin.install(this);
        }
        return this;
    }
};

/**
 * 外部配置方法注册为静态和非静态两种方式
 */

var _loop4 = function _loop4(key) {
    Object.defineProperty(EasyHttp, key, {
        get: function get() {
            return function () {
                return funcs[key].apply(this, arguments);
            }.bind(this);
        }
    });

    Object.defineProperty(EasyHttp.prototype, key, {
        get: function get() {
            return function () {
                return funcs[key].apply(this, arguments);
            }.bind(this);
        }
    });
};

for (var key in funcs) {
    _loop4(key);
}

module.exports = EasyHttp;
