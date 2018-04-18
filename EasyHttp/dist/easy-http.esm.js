/*!
* easy-http.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
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

function is(value, type) {
    // 先处理null和undefined
    if (value == null) {
        return value === type;
    }
    // instanceof 判断继承
    return value.constructor === type || value instanceof type;
}

var EasyHttp = function () {
    function EasyHttp(baseUrl, obj) {
        var _this = this;

        classCallCheck(this, EasyHttp);

        this.baseUrl = baseUrl;
        if (obj) {
            this.src = {};

            var _loop = function _loop(key) {
                _this.src[key] = _this.createSrc(obj[key]);
                Object.defineProperty(_this, key, {
                    get: function get$$1() {
                        var item = this.getRequestItem(key);
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
        key: "createSrc",
        value: function createSrc(obj) {
            var src = void 0;
            if (obj && is(obj, Object)) {
                src = {
                    action: obj.action,
                    urlFormat: obj.urlFormat
                };
                if (obj.dictate) {
                    var _dictate = obj.dictate.split(":");
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
        key: "getRequestItem",
        value: function getRequestItem(key) {
            this.requests || (this.requests = {});
            if (key in this.src && !(key in this.requests)) {
                this.requests[key] = this.createRequestItem(this.src[key]);
            }
            return this.requests && this.requests[key];
        }
    }, {
        key: "createRequestItem",
        value: function createRequestItem(src) {
            var item = {};
            var result = void 0;

            var _loop2 = function _loop2() {
                key = result[2];

                var matchs = {
                    match: result[0],
                    prefix: result[1],
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
                item.matchsMap[key] = matchs;
            };

            while ((result = reg.exec(src.urlFormat)) != null) {
                var key;

                _loop2();
            }
            var parentObj = this;
            Object.defineProperty(item, "handler", {
                get: function get$$1() {
                    return parentObj.createHandler(src, item);
                }
            });
            return item;
        }
    }, {
        key: "createHandler",
        value: function createHandler(src, item) {
            var parentObj = this;
            var handler = function handler(data) {
                return new Promise(function (resolve, reject) {
                    var url = this.getUrl(data);
                    var action = EasyHttp.actionMap && (EasyHttp.actionMap[src.action || ""] || EasyHttp.actionMap[""]);
                    if (action) {
                        action(resolve, reject, url);
                    } else {
                        var msg = src.action ? "not found the action:'" + src.action + "'" : "not found default action";
                        reject(msg);
                    }
                }.bind(handler));
            };
            var getUrl = function getUrl(data) {
                var qStr = parentObj.analysis(src, item.matchsMap, data);
                var url = parentObj.baseUrl + qStr;
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
            return handler;
        }
    }, {
        key: "analysis",
        value: function analysis(src, matchsMap, data) {
            var urlFormat = src.urlFormat;
            if (matchsMap) {
                data || (data = {});

                var _loop3 = function _loop3(key) {
                    var match = matchsMap[key];
                    var value = data[key];
                    var dictate = match.dictate || src.dictate;
                    if (dictate) {
                        dictate.forEach(function (e) {
                            var dictateHandler = EasyHttp.dictateMap && EasyHttp.dictateMap[e];
                            if (dictateHandler) {
                                value = dictateHandler(value);
                            }
                        });
                    } else if (EasyHttp.processors) {
                        EasyHttp.processors.forEach(function (p) {
                            value = p(value);
                        });
                    }
                    if (value) {
                        value = (match.prefix || "") + value + (match.suffix || "");
                    } else {
                        value = "";
                    }
                    urlFormat = urlFormat.replace(match.match, value);
                };

                for (var key in matchsMap) {
                    _loop3(key);
                }
            }
            urlFormat || (urlFormat = "");
            return urlFormat;
        }
    }], [{
        key: "bindAction",
        value: function bindAction(actionName, action) {
            if (!action) {
                return;
            }
            EasyHttp.actionMap || (EasyHttp.actionMap = {});
            EasyHttp.actionMap[actionName || ""] = action;
        }
    }, {
        key: "bindDictate",
        value: function bindDictate(dictate, handler) {
            if (!dictate || !handler) {
                return;
            }
            EasyHttp.dictateMap || (EasyHttp.dictateMap = {});
            EasyHttp.dictateMap[dictate] = handler;
        }
    }, {
        key: "addDefProcessor",
        value: function addDefProcessor() {
            var _EasyHttp$processors;

            for (var _len = arguments.length, processors = Array(_len), _key = 0; _key < _len; _key++) {
                processors[_key] = arguments[_key];
            }

            if (!processors) {
                return;
            }
            EasyHttp.processors || (EasyHttp.processors = new Array());
            (_EasyHttp$processors = EasyHttp.processors).push.apply(_EasyHttp$processors, processors);
        }
    }]);
    return EasyHttp;
}();

export default EasyHttp;
