/*
* easy-http v1.1.0
* (c) 2018-2019 PengYuan-Jiang
*/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.EasyHttp = factory());
}(this, function () { 'use strict';

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

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
        arr2[i] = arr[i];
      }

      return arr2;
    }
  }

  var arrayWithoutHoles = _arrayWithoutHoles;

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  var iterableToArray = _iterableToArray;

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var nonIterableSpread = _nonIterableSpread;

  function _toConsumableArray(arr) {
    return arrayWithoutHoles(arr) || iterableToArray(arr) || nonIterableSpread();
  }

  var toConsumableArray = _toConsumableArray;

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

  function initDictate(dictateStr) {
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
        var dictates = initDictate(result[3]) || undefined;
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
        conf: configGetter
      };

      if (obj) {
        if (is(obj, Object)) {
          var temp;
          (temp = obj.method || obj.m) && (this[pri$1].method = temp);
          (temp = obj.urlFormat || obj.u) && (this[pri$1].urlFormat = temp);
          this[pri$1].dictates = initDictate(obj.dictate || obj.d);
        } else {
          this[pri$1].urlFormat = obj;
        }
      }
    }

    createClass(RequestOption, [{
      key: "createUrl",
      value: function createUrl(data) {
        var nodes = this.odl && this.odl.nodes;
        data = objectSpread({}, data || {});
        var urlFormat = "";

        for (var i = 0, n = nodes && nodes.length || 0; i < n; i++) {
          var node = nodes[i];
          var block = void 0;

          switch (node.type) {
            case NODE_TYPE.TEXT:
              block = node.data;
              break;

            case NODE_TYPE.CMD:
              var cmdData = node.data;
              var val = data[cmdData.key];
              delete data[cmdData.key];
              val = this.dictateHandle(val, cmdData.dictates);

              if (val === undefined) {
                continue;
              }

              block = (cmdData.prefix || "") + val + (cmdData.suffix || "");
              break;
          }

          urlFormat = urlFormat + block;
        }

        var url = this.baseUrl + urlFormat;
        var query;

        for (var key in data) {
          var _val = data[key];
          _val = this.dictateHandle(_val);

          if (_val === undefined) {
            continue;
          }

          query = (query ? query + "&" : "") + key + "=" + _val;
        }

        if (query) {
          url += (url.indexOf("?") < 0 ? "?" : "&") + query;
        }

        return url;
      }
    }, {
      key: "dictateHandle",
      value: function dictateHandle(val, dictates) {
        var conf = this[pri$1].conf;
        val = conf.serializater(val);
        dictates || (dictates = this.dictates);

        if (dictates) {
          dictates.forEach(function (dictateName) {
            var dictateHandler = conf.getDictateHandler(dictateName);
            dictateHandler && (val = dictateHandler(val));
          });
        }

        return val;
      }
    }, {
      key: "baseUrl",
      get: function get() {
        return this[pri$1].conf.baseUrl || "";
      }
    }, {
      key: "method",
      get: function get() {
        return this[pri$1].method || this[pri$1].conf.defaultMethod;
      }
    }, {
      key: "urlFormat",
      get: function get() {
        return this[pri$1].urlFormat;
      }
    }, {
      key: "dictates",
      get: function get() {
        return this[pri$1].dictates || this[pri$1].conf.dictates;
      }
    }, {
      key: "odl",
      get: function get() {
        if (!("odl" in this[pri$1])) {
          this[pri$1].odl = this.urlFormat && new ODL(this.urlFormat) || undefined;
        }

        return this[pri$1].odl;
      }
    }]);

    return RequestOption;
  }();

  var Chain =
  /*#__PURE__*/
  function () {
    function Chain(interceptors) {
      var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

      classCallCheck(this, Chain);

      this.interceptors = interceptors;
      this.index = index;
    }

    createClass(Chain, [{
      key: "proceed",
      value: function proceed(request) {
        if (this.index >= this.interceptors.length) {
          throw "It's the last interceptor";
        }

        var chain = new Chain(this.interceptors, this.index + 1);
        return this.interceptors[this.index](request, function (request) {
          return chain.proceed(request);
        });
      }
    }]);

    return Chain;
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

  var DefaultMethod = "get";

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
        this.setDefaultMethod(options.defaultMethod);
        this.setDictate(options.dictate);
        this.setHeaders(options.headers);
        this.setRequestHandler(options.requestHandler);
        this.setInterceptor(options.interceptors);
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
      key: "setDefaultMethod",
      value: function setDefaultMethod(defaultMethod) {
        this[pri$2].defaultMethod = defaultMethod;
        return this;
      }
    }, {
      key: "setDictate",
      value: function setDictate(dictateStr) {
        this[pri$2].dictates = initDictate(dictateStr);
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
      key: "setInterceptor",
      value: function setInterceptor() {
        for (var _len2 = arguments.length, interceptors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          interceptors[_key2] = arguments[_key2];
        }

        if (interceptors && interceptors.length > 0) {
          this[pri$2].interceptors = [].concat(interceptors);
        } else {
          this[pri$2].interceptors = null;
        }
      }
    }, {
      key: "addInterceptor",
      value: function addInterceptor() {
        for (var _len3 = arguments.length, interceptors = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          interceptors[_key3] = arguments[_key3];
        }

        if (interceptors && interceptors.length > 0) {
          var _this$pri$interceptor;

          this[pri$2].interceptors || (this[pri$2].interceptors = []);

          (_this$pri$interceptor = this[pri$2].interceptors).push.apply(_this$pri$interceptor, interceptors);
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
      key: "getter",
      get: function get() {
        if (this[pri$2].getter) {
          return this[pri$2].getter;
        }

        var that = this;
        this[pri$2].getter = {
          get headers() {
            return that[pri$2].headers || Conf[pri$2].headers;
          },

          get defaultMethod() {
            return (that[pri$2].defaultMethod || Conf[pri$2].defaultMethod || DefaultMethod).toLowerCase();
          },

          get dictates() {
            return that[pri$2].dictates || Conf[pri$2].dictates;
          },

          get baseUrl() {
            return that[pri$2].baseUrl || Conf[pri$2].baseUrl;
          },

          get serializater() {
            return that[pri$2].serializater || Conf[pri$2].serializater || DefaultSerializater;
          },

          get requestHandler() {
            return that[pri$2].requestHandler || Conf[pri$2].requestHandler;
          },

          get interceptors() {
            return that[pri$2].interceptors || Conf[pri$2].interceptors;
          },

          get postInterceptors() {
            return that[pri$2].postInterceptors || Conf[pri$2].postInterceptors;
          },

          getDictateHandler: function getDictateHandler(dictateName) {
            return that[pri$2].dictateHandlers && that[pri$2].dictateHandlers[dictateName] || Conf[pri$2].dictateHandlers && Conf[pri$2].dictateHandlers[dictateName];
          }
        };
        return this[pri$2].getter;
      }
    }]);

    return ConfigureGetter;
  }(Configure);

  var EmptyArr = [];
  var EmptyObj = [];
  var pri$3 = Symbol("privateScope");

  var EasyHttp =
  /*#__PURE__*/
  function () {
    function EasyHttp(baseUrl, requests) {
      classCallCheck(this, EasyHttp);

      this[pri$3] = {
        conf: new ConfigureGetter()
      };
      this.setBaseUrl(baseUrl).addRequests(requests);
    } //发起请求


    createClass(EasyHttp, [{
      key: "request",
      value: function request(req) {
        var conf = this[pri$3].conf.getter;
        var requestHandler = conf.requestHandler;
        var interceptors = [].concat(toConsumableArray(conf.interceptors || EmptyArr), [//最后一个拦截器必须是请求处理
        function (request) {
          return requestHandler(request);
        }]);
        var chain = new Chain(interceptors);
        return chain.proceed({
          url: req.url,
          method: req.method,
          data: req.data,
          headers: objectSpread({}, conf.headers || EmptyObj, req.headers || EmptyObj),
          extraData: req.extraData
        });
      }
      /**
       * 创建请求函数
       */

    }, {
      key: "createHandler",
      value: function createHandler(reqOpt) {
        var _this = this;

        var _headers;

        var handler = function handler(req) {
          var url, method, data, headers, extraData;
          method = reqOpt.method;
          headers = _headers;

          if (req) {
            url = handler.getUrl(req.params);
            data = req.data;

            if (req.headers) {
              headers = headers ? objectSpread({}, headers, req.headers) : req.headers;
            }

            extraData = req.extraData;
          } else {
            url = handler.getUrl();
          }

          return _this.request({
            url: url,
            method: method,
            data: data,
            headers: headers,
            extraData: extraData
          });
        };

        handler.setHeaders = function (h) {
          _headers = h;
          return handler;
        };

        handler.addHeaders = function (h) {
          if (!h) {
            return handler;
          }

          _headers = objectSpread({}, _headers || EmptyObj, h);
          return handler;
        };

        handler.getUrl = function (data) {
          var url = reqOpt.createUrl(data);
          return url;
        };

        return handler;
      }
    }]);

    return EasyHttp;
  }();

  Object.defineProperty(EasyHttp.prototype, "addRequests", {
    configurable: false,
    enumerable: false,
    get: function get() {
      return function (requests) {
        var _this2 = this;

        if (!requests) {
          return this;
        }

        var _loop = function _loop(key) {
          var reqOpt = new RequestOption(_this2[pri$3].conf.getter, requests[key]);
          Object.defineProperty(_this2, key, {
            get: function get() {
              return this.createHandler(reqOpt);
            }
          });
        };

        for (var key in requests) {
          _loop(key);
        }

        return this;
      }.bind(this);
    }
  });
  /**
   * 对外配置方法注册为静态和非静态两种方式
   */

  var funcs = ["init", "setBaseUrl", "setDefaultMethod", "setDictate", "setHeaders", "addHeaders", "removeHeaders", "setRequestHandler", "setInterceptor", "addInterceptor", "setPostInterceptor", "addPostInterceptor", "setDictateHandler", "addDictateHandler", "removeDictateHandler", "setSerializater"];
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
          var _this$pri$conf;

          (_this$pri$conf = this[pri$3].conf)[key].apply(_this$pri$conf, arguments);

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
