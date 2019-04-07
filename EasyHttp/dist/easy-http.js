/*
* easy-http v1.0.3
* (c) 2018-2019 PengYuan-Jiang
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.EasyHttp = factory());
}(this, function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var classCallCheck = _classCallCheck;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var createClass = _createClass;

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  var defineProperty = _defineProperty;

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  var objectSpread = _objectSpread;

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
    } // instanceof 判断继承


    return value.constructor === type || value instanceof type;
  }

  var ODLUtils = {
    initDictate: function initDictate(dictateStr) {
      if (dictateStr) {
        var dictates;
        var cmds = dictateStr.split(":");

        for (var i = 0, n = cmds.length; i < n; i++) {
          var e = cmds[i];

          if (e) {
            (dictates || (dictates = [])).push(e);
          }
        }

        return dictates;
      }
    }
  };

  var REG = /(?:{([^{}]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^{}]*)})?/gi; //结点类型

  var NODE_TYPE = {
    TEXT: "text",
    CMD: "cmd"
  };
  var pri = Symbol("privateScope"); //节点树

  var ODLConstructor =
  /*#__PURE__*/
  function () {
    function ODLConstructor(requestTpl) {
      classCallCheck(this, ODLConstructor);

      this[pri] = {};
      var tpl = requestTpl;

      if (!tpl) {
        return;
      }

      var nodes = this[pri].nodes = [];
      var keys;
      var lastIndex = 0;
      var result;

      while (result = REG.exec(tpl)) {
        keys || (keys = this[pri].keys = []);
        var index = result["index"];

        if (lastIndex < index) {
          nodes.push({
            type: NODE_TYPE.TEXT,
            data: tpl.substring(lastIndex, index)
          });
        }

        var key = result[2];
        var dictates = ODLUtils.initDictate(result[3]) || undefined;
        nodes.push({
          type: NODE_TYPE.CMD,
          data: {
            key: key,
            dictates: dictates || undefined,
            prefix: result[1] || undefined,
            suffix: result[4] || undefined
          }
        });
        keys[key] = 1;
        lastIndex = index + result[0].length;
      }

      var length = tpl.length;

      if (lastIndex < length) {
        nodes.push({
          type: NODE_TYPE.TEXT,
          data: tpl.substring(lastIndex, length)
        });
      }
    }

    createClass(ODLConstructor, [{
      key: "toRequestTpl",
      //转为请求模板
      value: function toRequestTpl() {
        if (!this.nodes) {
          return "";
        }

        var tpl = "";

        for (var i = 0, n = this.nodes.length; i < n; i++) {
          var node = this.nodes[i];
          var cmdStr = "";

          switch (node.type) {
            case NODE_TYPE.CMD:
              cmdStr = node.data.key;

              if (node.data.dictates) {
                cmdStr = "".concat(cmdStr, ":").concat(node.data.dictates.join(":"));
              }

              cmdStr = "{".concat(cmdStr, "}");

              if (node.data.prefix || node.data.suffix) {
                cmdStr = "{".concat(node.data.prefix || "").concat(cmdStr).concat(node.data.suffix || "", "}");
              }

              break;

            case NODE_TYPE.TEXT:
            default:
              cmdStr = node.data;
          }

          tpl = tpl + cmdStr;
        }

        return tpl;
      }
    }, {
      key: "nodes",
      get: function get() {
        return this[pri].nodes;
      }
    }, {
      key: "keys",
      get: function get() {
        return this[pri].keys;
      }
    }]);

    return ODLConstructor;
  }();

  var ODL = ODLConstructor;

  var pri$1 = Symbol("privateScope");

  var RequestOption =
  /*#__PURE__*/
  function () {
    function RequestOption(configGetter, obj) {
      classCallCheck(this, RequestOption);

      this[pri$1] = {
        configGetter: configGetter
      };

      if (obj) {
        if (is(obj, Object)) {
          var temp;
          (temp = obj.action || obj.a) && (this[pri$1].action = temp);
          (temp = obj.urlFormat || obj.u) && (this[pri$1].urlFormat = temp);
          (temp = obj.dictate || obj.d) && (this[pri$1].requestDictate = temp);
        } else {
          this[pri$1].urlFormat = obj;
        }
      }
    }

    createClass(RequestOption, [{
      key: "analysis",

      /**
       * 参数解析
       */
      value: function analysis(data) {
        var _this = this;

        var nodes = this.odl.nodes;
        data = objectSpread({}, data || {});
        var urlFormat = "";

        for (var i = 0, n = nodes.length; i < n; i++) {
          var node = nodes[i];
          var block = void 0;

          var _ret = function () {
            switch (node.type) {
              case NODE_TYPE.TEXT:
                block = node.data;
                break;

              case NODE_TYPE.CMD:
                var cmdData = node.data;
                var val = data[cmdData.key];
                delete data[cmdData.key];
                var szr = _this.serializater;
                val = szr(val);

                if (cmdData.dictates) {
                  cmdData.dictates.forEach(function (e) {
                    var hd = _this.dictateMap(e);

                    if (hd) {
                      val = hd(val);
                    }
                  });
                }

                if (val === undefined) {
                  return "continue";
                }

                block = (cmdData.prefix || "") + val + (cmdData.suffix || "");
                break;
            }
          }();

          if (_ret === "continue") continue;
          urlFormat = urlFormat + block;
        }

        var url = this.baseUrl + urlFormat;
        var query;

        for (var key in data) {
          var val = data[key];

          if (val === undefined) {
            continue;
          } // query += (query ? "&" : "") + key + "=" + val;


          query = (query ? query + "&" : "") + key + "=" + val;
        }

        if (query) {
          url += (url.indexOf("?") < 0 ? "?" : "&") + query;
        }

        return url;
      }
    }, {
      key: "conf",
      get: function get() {
        return this[pri$1].configGetter;
      }
    }, {
      key: "action",
      get: function get() {
        return this[pri$1].action;
      }
    }, {
      key: "urlFormat",
      get: function get() {
        return this[pri$1].urlFormat;
      }
    }, {
      key: "requestDictate",
      get: function get() {
        return this[pri$1].requestDictate;
      }
    }, {
      key: "odl",
      get: function get() {
        if (!(["odl"] in this[pri$1])) {
          this[pri$1].odl = this.urlFormat && new ODL(this.urlFormat) || undefined;
        }

        return this[pri$1].odl;
      }
    }]);

    return RequestOption;
  }();

  var Requester =
  /*#__PURE__*/
  function () {
    function Requester(requestOption) {
      classCallCheck(this, Requester);

      this.ro = requestOption;
    }

    createClass(Requester, [{
      key: "createHandler",

      /**
       * 创建请求函数
       */
      value: function createHandler() {
        var $slef = this;
        var header;

        var handler = function handler(options) {
          var promise = new Promise(function (resolve, reject) {
            var url = handler.getUrl(options && options.params);
            var actionName = $slef.ro.action;
            var request = {
              url: url,
              params: options && options.params,
              action: actionName,
              data: options && options.data,
              other: options && options.other,
              header: options.header ? objectSpread({}, handler.getHeader(), options.header) : handler.getHeader()
            };
            var hd = $slef.ro.handler;

            if (hd) {
              var prhds = $slef.ro.preHandlers;

              if (prhds && prhds.length > 0) {
                for (var i = 0, len = prhds.length; i < len; i++) {
                  if (prhds[i](request, resolve, reject)) {
                    return;
                  }
                }
              }

              try {
                hd(request).then(function (resp) {
                  resolve({
                    request: request,
                    response: resp
                  });
                })["catch"](function (resp) {
                  reject({
                    errType: 0,
                    request: request,
                    response: resp
                  });
                });
              } catch (e) {
                reject({
                  errType: -1,
                  request: request,
                  msg: e
                });
              }
            } else {
              reject({
                errType: -1,
                request: request,
                msg: "not found handler"
              });
            }
          });
          var pohds = $slef.ro.postHandlers;

          if (pohds && pohds.length > 0) {
            return Promise.resolve().then(function () {
              var _p = promise;

              for (var i = 0, len = pohds.length; i < len; i++) {
                _p = pohds[i](_p);
              }

              return _p;
            });
          } else {
            return promise;
          }
        };

        handler.setHeader = function (h) {
          header = h ? objectSpread({}, h) : null;
          return handler;
        };

        handler.addHeader = function (h) {
          if (!h) {
            return handler;
          }

          header = objectSpread({}, this.getHeader(), h);
          return handler;
        };

        handler.getHeader = function () {
          return header || $slef.ro.header;
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

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var _typeof_1 = createCommonjsModule(function (module) {
  function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

  function _typeof(obj) {
    if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
      module.exports = _typeof = function _typeof(obj) {
        return _typeof2(obj);
      };
    } else {
      module.exports = _typeof = function _typeof(obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
      };
    }

    return _typeof(obj);
  }

  module.exports = _typeof;
  });

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var assertThisInitialized = _assertThisInitialized;

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof_1(call) === "object" || typeof call === "function")) {
      return call;
    }

    return assertThisInitialized(self);
  }

  var possibleConstructorReturn = _possibleConstructorReturn;

  var getPrototypeOf = createCommonjsModule(function (module) {
  function _getPrototypeOf(o) {
    module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  module.exports = _getPrototypeOf;
  });

  var setPrototypeOf = createCommonjsModule(function (module) {
  function _setPrototypeOf(o, p) {
    module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  module.exports = _setPrototypeOf;
  });

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) setPrototypeOf(subClass, superClass);
  }

  var inherits = _inherits;

  var DefaultAction = "get";

  var DefaultSerializater = function DefaultSerializater(value) {
    if (is(value, Object)) {
      value = JSON.stringify(value);
    }

    return value;
  };

  var pri$2 = Symbol("privateScope"); //可配置类基类

  var Configure =
  /*#__PURE__*/
  function () {
    function Configure() {
      classCallCheck(this, Configure);

      this[pri$2] = {};
    }

    createClass(Configure, [{
      key: "init",
      value: function init(options) {
        if (!options) {
          return;
        }

        this.setBaseUrl(options.baseUrl);
        this.setAction(options.action);
        this.setDictate(options.dictate);
        this.setHeaders(options.headers);
        this.setRequestHandler(options.requestHandler);
        this.setPreInterceptor(options.preInterceptors);
        this.setPostInterceptor(options.postInterceptors);
        this.setSerializater(options.serializater);
      }
    }, {
      key: "setBaseUrl",
      value: function setBaseUrl(baseUrl) {
        this[pri$2].baseUrl = baseUrl || undefined;
        return this;
      }
    }, {
      key: "setAction",
      value: function setAction(action) {
        this[pri$2].action = action;
        return this;
      }
    }, {
      key: "setDictate",
      value: function setDictate(dictateStr) {
        this[pri$2].dictates = ODLUtils.initDictate(dictateStr);
        return this;
      }
    }, {
      key: "setHeaders",
      value: function setHeaders(headers) {
        if (headers) {
          this[pri$2].headers = objectSpread({}, headers);
        } else {
          this[pri$2].headers = undefined;
        }

        return this;
      }
    }, {
      key: "addHeaders",
      value: function addHeaders(headers) {
        if (!headers) {
          return this;
        }

        if (this[pri$2].headers) {
          this[pri$2].headers = objectSpread({}, this[pri$2].headers, headers);
        } else {
          this[pri$2].headers = objectSpread({}, headers);
        }

        return this;
      }
    }, {
      key: "removeHeaders",
      value: function removeHeaders() {
        var _this = this;

        for (var _len = arguments.length, names = new Array(_len), _key = 0; _key < _len; _key++) {
          names[_key] = arguments[_key];
        }

        if (this[pri$2].headers && names && names.length > 0) {
          names.forEach(function (name) {
            name in _this[pri$2].headers && delete _this[pri$2].headers[name];
          });
        }
      }
    }, {
      key: "setRequestHandler",
      value: function setRequestHandler(requestHandler) {
        this[pri$2].requestHandler = requestHandler || undefined;
        return this;
      }
    }, {
      key: "setPreInterceptor",
      value: function setPreInterceptor() {
        for (var _len2 = arguments.length, preInterceptors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          preInterceptors[_key2] = arguments[_key2];
        }

        if (preInterceptors && preInterceptors.length > 0) {
          this[pri$2].preInterceptors = [].concat(preInterceptors);
        } else {
          this[pri$2].preInterceptors = null;
        }
      }
    }, {
      key: "addPreInterceptor",
      value: function addPreInterceptor() {
        for (var _len3 = arguments.length, preInterceptors = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          preInterceptors[_key3] = arguments[_key3];
        }

        if (preInterceptors && preInterceptors.length > 0) {
          var _this$pri$preIntercep;

          this[pri$2].preInterceptors || (this[pri$2].preInterceptors = []);

          (_this$pri$preIntercep = this[pri$2].preInterceptors).push.apply(_this$pri$preIntercep, preInterceptors);
        }

        return this;
      }
    }, {
      key: "setPostInterceptor",
      value: function setPostInterceptor() {
        for (var _len4 = arguments.length, postInterceptors = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          postInterceptors[_key4] = arguments[_key4];
        }

        if (postInterceptors && postInterceptors.length > 0) {
          this[pri$2].postInterceptors = [].concat(postInterceptors);
        } else {
          this[pri$2].postInterceptors = undefined;
        }

        return this;
      }
    }, {
      key: "addPostInterceptor",
      value: function addPostInterceptor() {
        for (var _len5 = arguments.length, postInterceptors = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
          postInterceptors[_key5] = arguments[_key5];
        }

        if (postInterceptors && postInterceptors.length > 0) {
          var _this$pri$postInterce;

          this[pri$2].postInterceptors || (this[pri$2].postInterceptors = []);

          (_this$pri$postInterce = this[pri$2].postInterceptors).push.apply(_this$pri$postInterce, postInterceptors);
        }

        return this;
      }
    }, {
      key: "setDictateHandler",
      value: function setDictateHandler(dictateHandlers) {
        if (dictateHandlers) {
          this[pri$2].dictateHandlers = objectSpread({}, dictateHandlers);
        } else {
          this[pri$2].dictateHandlers = undefined;
        }

        return this;
      }
    }, {
      key: "addDictateHandler",
      value: function addDictateHandler(dictateHandlers) {
        if (!dictateHandlers) {
          return this;
        }

        if (this[pri$2].dictateHandlers) {
          this[pri$2].dictateHandlers = objectSpread({}, this[pri$2].dictateHandlers, dictateHandlers);
        } else {
          this[pri$2].dictateHandlers = objectSpread({}, dictateHandlers);
        }

        return this;
      }
    }, {
      key: "removeDictateHandler",
      value: function removeDictateHandler() {
        var _this2 = this;

        for (var _len6 = arguments.length, names = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
          names[_key6] = arguments[_key6];
        }

        if (this[pri$2].dictateHandlers && names && names.length > 0) {
          names.forEach(function (name) {
            name in _this2[pri$2].dictateHandlers && delete _this2[pri$2].dictateHandlers[name];
          });
        }
      }
    }, {
      key: "setSerializater",
      value: function setSerializater(serializater) {
        this[pri$2].serializater = serializater;
        return this;
      }
      /**
       * 插件安装
       */

    }, {
      key: "use",
      value: function use(plugin) {
        plugin.install(this);
        return this;
      }
    }]);

    return Configure;
  }();

  var Conf = new Configure();
  var ConfigureGetter =
  /*#__PURE__*/
  function (_Configure) {
    inherits(ConfigureGetter, _Configure);

    function ConfigureGetter() {
      classCallCheck(this, ConfigureGetter);

      return possibleConstructorReturn(this, getPrototypeOf(ConfigureGetter).apply(this, arguments));
    }

    createClass(ConfigureGetter, [{
      key: "configureGetter",
      get: function get() {
        if (!this[pri$2].configGetter) {
          this[pri$2].configGetter = {
            get defaultHeaders() {
              return this[pri$2].headers || Conf[pri$2].headers;
            },

            get defaultAction() {
              return (this[pri$2].action || Conf[pri$2].action || DefaultAction).toLowerCase();
            },

            get defaultDictates() {
              return this[pri$2].dictates || Conf[pri$2].dictates;
            },

            get baseUrl() {
              return this[pri$2].baseUrl || Conf[pri$2].baseUrl;
            },

            get serializater() {
              return this[pri$2].serializater || Conf[pri$2].serializater || DefaultSerializater;
            },

            get requestHandler() {
              return this[pri$2].requestHandler || Conf[pri$2].requestHandler;
            },

            get preInterceptors() {
              return this[pri$2].preInterceptors || Conf[pri$2].preInterceptors;
            },

            get postInterceptors() {
              return this[pri$2].postInterceptors || Conf[pri$2].postInterceptors;
            },

            dictateMap: function dictateMap(dictateName) {
              return this[pri$2].dictateHandlers && this[pri$2].dictateHandlers[dictateName] || Conf[pri$2].dictateHandlers && Conf[pri$2].dictateHandlers[dictateName];
            }
          };
        }
      }
    }]);

    return ConfigureGetter;
  }(Configure);

  var _ref = [Symbol("requestOptions"), Symbol("requesters"), Symbol("configure"), Symbol("getRequestItem")],
      rqots = _ref[0],
      rqers = _ref[1],
      in_conf = _ref[2],
      getRequestItem = _ref[3];

  var EasyHttp =
  /*#__PURE__*/
  function () {
    function EasyHttp(baseUrl, requests) {
      classCallCheck(this, EasyHttp);

      this[in_conf] = new ConfigureGetter();
      this.setBaseUrl(baseUrl).addRequests(requests);
    }

    createClass(EasyHttp, [{
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
            _this[rqots][key] = new RequestOption(_this[in_conf].configureGetter, requests[key]);
            Object.defineProperty(_this, key, {
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

  var funcs = ["init", "setBaseUrl", "setAction", "setDictate", "setHeaders", "addHeaders", "removeHeaders", "setRequestHandler", "setPreInterceptor", "addPreInterceptor", "setPostInterceptor", "addPostInterceptor", "setDictateHandler", "addDictateHandler", "removeDictateHandler", "setSerializater"];
  var n = funcs.length;

  var _loop2 = function _loop2(i) {
    var key = funcs[i];
    Object.defineProperty(EasyHttp, key, {
      configurable: false,
      enumerable: false,
      get: function get() {
        return function () {
          Conf[key].apply(Conf, arguments);
          return this;
        }.bind(this);
      }
    });
    Object.defineProperty(EasyHttp.prototype, key, {
      configurable: false,
      enumerable: false,
      get: function get() {
        return function () {
          var _this$in_conf;

          (_this$in_conf = this[in_conf])[key].apply(_this$in_conf, arguments);

          return this;
        }.bind(this);
      }
    });
  };

  for (var i = 0; i < n; i++) {
    _loop2(i);
  }

  return EasyHttp;

}));
