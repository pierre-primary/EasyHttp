/*!
* easy-http.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
var Logger = {
    i: function i(key, str) {
        console.log(key + ": " + str);
    },
    d: function d(key, str) {
        console.debug(key + ": " + str);
    },
    w: function w(key, str) {
        console.warn(key + ": " + str);
    },
    e: function e(key, str) {
        console.error(key + ": " + str);
    }
};

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var reg = /(?:\[([^{[]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^}\]]*)\])?/gi;

var _ref = [Symbol("createSrc"), Symbol("getRequestItem"), Symbol("createRequestItem"), Symbol("createHandler"), Symbol("analysis"), Symbol("baseUrl"), Symbol("src"), Symbol("requests"), Symbol("dictateMap"), Symbol("actionMap"), Symbol("serializater"), Symbol("processors"), Symbol("logConfig")],
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
    _logConfig2 = _ref[12];

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

var EasyHttp = function () {
    function EasyHttp(_baseUrl, obj) {
        var _this = this;

        classCallCheck(this, EasyHttp);

        this[baseUrl] = _baseUrl;
        if (obj) {
            this[src] = {};

            var _loop = function _loop(key) {
                _this[src][key] = _this[createSrc](obj[key]);
                Object.defineProperty(_this, key, {
                    get: function get$$1() {
                        var item = this[getRequestItem](key);
                        return item && item.handler;
                    }
                });
            };

            for (var key in obj) {
                _loop(key);
            }
        }
    }

    createClass(EasyHttp, [{
        key: createSrc,
        value: function value(obj) {
            var src = void 0;
            if (obj && is(obj, Object)) {
                src = {
                    action: obj.action || obj.a,
                    urlFormat: obj.urlFormat || obj.u
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
    }, {
        key: getRequestItem,
        value: function value(key) {
            this[requests] || (this[requests] = {});
            if (key in this[src] && !(key in this[requests])) {
                this[requests][key] = this[createRequestItem](this[src][key]);
            }
            return this[requests] && this[requests][key];
        }
    }, {
        key: createRequestItem,
        value: function value(src) {
            var item = {};
            var result = void 0;

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
                item.matchsArray || (item.matchsArray = new Array());
                item.matchsArray.push(matchs);
            };

            while ((result = reg.exec(src.urlFormat)) != null) {
                _loop2();
            }
            var parentObj = this;
            Object.defineProperty(item, "handler", {
                get: function get$$1() {
                    return parentObj[createHandler](src, item);
                }
            });
            return item;
        }
    }, {
        key: createHandler,
        value: function value(src, item) {
            var parentObj = this;
            var handleCatch = false;
            var handler = function handler(data) {
                var promise = new Promise(function (_resolve, _reject) {
                    function resolve(value) {
                        Logger.i(value);
                        return _resolve(value);
                    }
                    function reject(reason) {
                        Logger.e(reason);
                        return handleCatch ? _reject(reason) : false;
                    }
                    var url = this.getUrl(data);
                    i("EasyHttp-Url", url);
                    var actionName = (src.action || "").toLowerCase();
                    var action = this[actionMap] && this[actionMap][actionName] || EasyHttp[actionMap] && EasyHttp[actionMap][actionName];
                    if (!action) {
                        var msg = src.action ? "not found the action:'" + src.action + "'" : "not found default action";
                        reject(msg);
                    } else if (!is(action, Function)) {
                        var _msg = src.action ? "the action:'" + src.action + "' is not Function" : "default action is not Function";
                        reject(_msg);
                        return;
                    } else {
                        action(resolve, reject, url);
                    }
                }.bind(handler));
                return promise;
            };
            var getUrl = function getUrl(data) {
                var qStr = parentObj[analysis](src, item.matchsArray, data);
                var url = parentObj[baseUrl] + qStr;
                return url;
            };
            Object.defineProperty(handler, "getUrl", {
                get: function get$$1() {
                    return getUrl;
                }
            });
            var header = function (header) {
                this.header = header;
                return this;
            }.bind(handler);
            Object.defineProperty(handler, "header", {
                get: function get$$1() {
                    return header;
                }
            });
            var defCatchHandler = function () {
                handleCatch = true;
                if (arguments && arguments.length > 0) {
                    return this.apply(undefined, arguments);
                } else {
                    return this;
                }
            }.bind(handler);
            Object.defineProperty(handler, "c", {
                get: function get$$1() {
                    return defCatchHandler;
                }
            });
            return handler;
        }
    }, {
        key: analysis,
        value: function value(src, matchsArray, data) {
            var _this2 = this;

            var urlFormat = src.urlFormat;
            if (matchsArray) {
                data || (data = {});
                matchsArray.forEach(function (match) {
                    var key = match.key;
                    var value = data[key];
                    var szr = _this2[serializater] || EasyHttp[serializater] || defSerializater;
                    value = szr(value);
                    var dictate = match.dictate || src.dictate;
                    if (dictate) {
                        dictate.forEach(function (e) {
                            var dictateHandler = _this2[dictateMap] && _this2[dictateMap][e] || EasyHttp[dictateMap] && EasyHttp[dictateMap][e];
                            if (dictateHandler) {
                                value = dictateHandler(value);
                            }
                        });
                    } else {
                        var _processors2 = _this2[_processors2] || EasyHttp[_processors2];
                        if (_processors2) {
                            _processors2.forEach(function (p) {
                                value = p(value);
                            });
                        }
                    }
                    if (value) {
                        value = (match.prefix || "") + value + (match.suffix || "");
                    } else {
                        value = "";
                    }
                    urlFormat = urlFormat.replace(match.match, value);
                });
            }
            urlFormat || (urlFormat = "");
            return urlFormat;
        }
    }, {
        key: "bindAction",
        value: function bindAction(actionName, action) {
            actionName || (actionName = "");
            this[actionMap] || (this[actionMap] = {});
            if (!action) {
                return;
            }
            this[actionMap][actionName.toLowerCase()] = action;
        }
    }, {
        key: "bindDictate",
        value: function bindDictate(dictate, handler) {
            this[dictateMap] || (this[dictateMap] = {});
            if (!dictate || !handler) {
                return;
            }
            this[dictateMap][dictate.toLowerCase()] = handler;
        }
    }, {
        key: "setSerializater",
        value: function setSerializater(_serializater) {
            this[serializater] = _serializater;
        }
    }, {
        key: "addProcessor",
        value: function addProcessor() {
            var _processors3;

            for (var _len = arguments.length, _processors = Array(_len), _key = 0; _key < _len; _key++) {
                _processors[_key] = arguments[_key];
            }

            this[processors] || (this[processors] = new Array());
            if (!_processors) {
                return;
            }
            (_processors3 = this[processors]).push.apply(_processors3, _processors);
        }
    }, {
        key: "use",
        value: function use(plugin) {
            if (plugin && plugin.install && is(plugin.install, Function)) {
                plugin.install(this);
            }
        }
    }], [{
        key: "bindAction",
        value: function bindAction(actionName, action) {
            actionName || (actionName = "");
            this[actionMap] || (this[actionMap] = {});
            if (!action) {
                return;
            }
            this[actionMap][actionName.toLowerCase()] = action;
        }
    }, {
        key: "bindDictate",
        value: function bindDictate(dictate, handler) {
            this[dictateMap] || (this[dictateMap] = {});
            if (!dictate || !handler) {
                return;
            }
            this[dictateMap][dictate.toLowerCase()] = handler;
        }
    }, {
        key: "setSerializater",
        value: function setSerializater(_serializater) {
            this[serializater] = _serializater;
        }
    }, {
        key: "addProcessor",
        value: function addProcessor() {
            var _processors4;

            for (var _len2 = arguments.length, _processors = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                _processors[_key2] = arguments[_key2];
            }

            this[processors] || (this[processors] = new Array());
            if (!_processors) {
                return;
            }
            (_processors4 = this[processors]).push.apply(_processors4, _processors);
        }
    }, {
        key: "use",
        value: function use(plugin) {
            if (plugin && plugin.install && is(plugin.install, Function)) {
                plugin.install(this);
            }
        }
    }, {
        key: "logConfig",
        value: function logConfig(_logConfig) {
            this[_logConfig2] = _logConfig;
        }
    }]);
    return EasyHttp;
}();

export default EasyHttp;
