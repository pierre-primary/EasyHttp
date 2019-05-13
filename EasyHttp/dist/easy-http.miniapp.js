/*
* easy-http v1.1.0
* (c) 2018-2019 PengYuan-Jiang
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
  } // instanceof 判断继承


  return value.constructor === type || value instanceof type;
}

function initDictate(dictateStr) {
  if (dictateStr) {
    let dictates;
    let cmds = dictateStr.split(":");

    for (let i = 0, n = cmds.length; i < n; i++) {
      let e = cmds[i];

      if (e) {
        (dictates || (dictates = [])).push(e);
      }
    }

    return dictates;
  }
}

const REG = /(?:{([^{}]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^{}]*)})?/gi; //结点类型

const NODE_TYPE = {
  TEXT: "text",
  CMD: "cmd"
};
const pri = Symbol("privateScope"); //节点树

class ODLConstructor {
  constructor(requestTpl) {
    this[pri] = {};
    let tpl = requestTpl;

    if (!tpl) {
      return;
    }

    let nodes = this[pri].nodes = [];
    let keys;
    let lastIndex = 0;
    let result;

    while (result = REG.exec(tpl)) {
      keys || (keys = this[pri].keys = []);
      let index = result["index"];

      if (lastIndex < index) {
        nodes.push({
          type: NODE_TYPE.TEXT,
          data: tpl.substring(lastIndex, index)
        });
      }

      let key = result[2];
      let dictates = initDictate(result[3]) || undefined;
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

    let length = tpl.length;

    if (lastIndex < length) {
      nodes.push({
        type: NODE_TYPE.TEXT,
        data: tpl.substring(lastIndex, length)
      });
    }
  }

  get nodes() {
    return this[pri].nodes;
  }

  get keys() {
    return this[pri].keys;
  } //转为请求模板


  toRequestTpl() {
    if (!this.nodes) {
      return "";
    }

    let tpl = "";

    for (let i = 0, n = this.nodes.length; i < n; i++) {
      let node = this.nodes[i];
      let cmdStr = "";

      switch (node.type) {
        case NODE_TYPE.CMD:
          cmdStr = node.data.key;

          if (node.data.dictates) {
            cmdStr = `${cmdStr}:${node.data.dictates.join(":")}`;
          }

          cmdStr = `{${cmdStr}}`;

          if (node.data.prefix || node.data.suffix) {
            cmdStr = `{${node.data.prefix || ""}${cmdStr}${node.data.suffix || ""}}`;
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

}

const ODL = ODLConstructor;

const pri$1 = Symbol("privateScope");
class RequestOption {
  constructor(configGetter, obj) {
    this[pri$1] = {
      conf: configGetter
    };

    if (obj) {
      if (is(obj, Object)) {
        let temp;
        (temp = obj.method || obj.m) && (this[pri$1].method = temp);
        (temp = obj.urlFormat || obj.u) && (this[pri$1].urlFormat = temp);
        this[pri$1].dictates = initDictate(obj.dictate || obj.d);
      } else {
        this[pri$1].urlFormat = obj;
      }
    }
  }

  get baseUrl() {
    return this[pri$1].conf.baseUrl || "";
  }

  get method() {
    return this[pri$1].method || this[pri$1].conf.defaultMethod;
  }

  get urlFormat() {
    return this[pri$1].urlFormat;
  }

  get dictates() {
    return this[pri$1].dictates || this[pri$1].conf.dictates;
  }

  get odl() {
    if (!("odl" in this[pri$1])) {
      this[pri$1].odl = this.urlFormat && new ODL(this.urlFormat) || undefined;
    }

    return this[pri$1].odl;
  }

  createUrl(data) {
    let nodes = this.odl && this.odl.nodes;
    data = { ...(data || {})
    };
    let urlFormat = "";

    for (let i = 0, n = nodes && nodes.length || 0; i < n; i++) {
      let node = nodes[i];
      let block;

      switch (node.type) {
        case NODE_TYPE.TEXT:
          block = node.data;
          break;

        case NODE_TYPE.CMD:
          let cmdData = node.data;
          let val = data[cmdData.key];
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

    let url = this.baseUrl + urlFormat;
    let query;

    for (let key in data) {
      let val = data[key];
      val = this.dictateHandle(val);

      if (val === undefined) {
        continue;
      }

      query = (query ? query + "&" : "") + key + "=" + val;
    }

    if (query) {
      url += (url.indexOf("?") < 0 ? "?" : "&") + query;
    }

    return url;
  }

  dictateHandle(val, dictates) {
    let conf = this[pri$1].conf;
    val = conf.serializater(val);

    if (dictates || (dictates = this.dictates)) {
      dictates.forEach(dictateName => {
        let dictateHandler = conf.getDictateHandler(dictateName);
        dictateHandler && (val = dictateHandler(val));
      });
    }

    return val;
  }

}

class Chain {
  constructor(interceptors, index = 0) {
    this.interceptors = interceptors;
    this.index = index;
  }

  proceed(request) {
    if (this.index >= this.interceptors.length) {
      throw "It's the last interceptor";
    }

    let chain = new Chain(this.interceptors, this.index + 1);
    return this.interceptors[this.index](request, request => chain.proceed(request));
  }

}

const DefaultMethod = "get";

const DefaultSerializater = function (value) {
  if (is(value, Object)) {
    value = JSON.stringify(value);
  }

  return value;
};

const pri$2 = Symbol("privateScope"); //可配置类基类

class Configure {
  constructor() {
    this[pri$2] = {};
  }

  init(options) {
    if (!options) {
      return;
    }

    this.setBaseUrl(options.baseUrl);
    this.setDefaultMethod(options.defaultMethod);
    this.setDictate(options.dictate);
    this.setHeaders(options.headers);
    this.setRequestHandler(options.requestHandler);
    this.setInterceptor(options.interceptors);
    this.setSerializater(options.serializater);
  }

  setBaseUrl(baseUrl) {
    this[pri$2].baseUrl = baseUrl || undefined;
    return this;
  }

  setDefaultMethod(defaultMethod) {
    this[pri$2].defaultMethod = defaultMethod;
    return this;
  }

  setDictate(dictateStr) {
    this[pri$2].dictates = initDictate(dictateStr);
    return this;
  }

  setHeaders(headers) {
    if (headers) {
      this[pri$2].headers = { ...headers
      };
    } else {
      this[pri$2].headers = undefined;
    }

    return this;
  }

  addHeaders(headers) {
    if (!headers) {
      return this;
    }

    if (this[pri$2].headers) {
      this[pri$2].headers = { ...this[pri$2].headers,
        ...headers
      };
    } else {
      this[pri$2].headers = { ...headers
      };
    }

    return this;
  }

  removeHeaders(...names) {
    if (this[pri$2].headers && names && names.length > 0) {
      names.forEach(name => {
        name in this[pri$2].headers && delete this[pri$2].headers[name];
      });
    }
  }

  setRequestHandler(requestHandler) {
    this[pri$2].requestHandler = requestHandler || undefined;
    return this;
  }

  setInterceptor(...interceptors) {
    if (interceptors && interceptors.length > 0) {
      this[pri$2].interceptors = [...interceptors];
    } else {
      this[pri$2].interceptors = null;
    }
  }

  addInterceptor(...interceptors) {
    if (interceptors && interceptors.length > 0) {
      this[pri$2].interceptors || (this[pri$2].interceptors = []);
      this[pri$2].interceptors.push(...interceptors);
    }

    return this;
  }

  setDictateHandler(dictateHandlers) {
    if (dictateHandlers) {
      this[pri$2].dictateHandlers = { ...dictateHandlers
      };
    } else {
      this[pri$2].dictateHandlers = undefined;
    }

    return this;
  }

  addDictateHandler(dictateHandlers) {
    if (!dictateHandlers) {
      return this;
    }

    if (this[pri$2].dictateHandlers) {
      this[pri$2].dictateHandlers = { ...this[pri$2].dictateHandlers,
        ...dictateHandlers
      };
    } else {
      this[pri$2].dictateHandlers = { ...dictateHandlers
      };
    }

    return this;
  }

  removeDictateHandler(...names) {
    if (this[pri$2].dictateHandlers && names && names.length > 0) {
      names.forEach(name => {
        name in this[pri$2].dictateHandlers && delete this[pri$2].dictateHandlers[name];
      });
    }
  }

  setSerializater(serializater) {
    this[pri$2].serializater = serializater;
    return this;
  }

}

const Conf = new Configure();
class ConfigureGetter extends Configure {
  get getter() {
    if (this[pri$2].getter) {
      return this[pri$2].getter;
    }

    let that = this;
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

      getDictateHandler(dictateName) {
        return that[pri$2].dictateHandlers && that[pri$2].dictateHandlers[dictateName] || Conf[pri$2].dictateHandlers && Conf[pri$2].dictateHandlers[dictateName];
      }

    };
    return this[pri$2].getter;
  }

}

const EmptyArr = [];
const EmptyObj = [];
const pri$3 = Symbol("privateScope");

class EasyHttp {
  constructor(baseUrl, requests) {
    this[pri$3] = {
      conf: new ConfigureGetter()
    };
    this.setBaseUrl(baseUrl).addRequests(requests);
  } //发起请求


  request(req) {
    if (!req) {
      throw "req is required";
    }

    let conf = this[pri$3].conf.getter;
    let requestHandler = conf.requestHandler;

    if (!requestHandler) {
      throw "requestHandler has not been set yet";
    }

    let interceptors = [//拦截器
    ...(conf.interceptors || EmptyArr), //最后一个拦截器必须是请求处理
    request => {
      return requestHandler(request);
    }];
    let chain = new Chain(interceptors);
    let headers;

    if (req.coverHeaders) {
      headers = req.headers || EmptyObj;
    } else {
      headers = { ...(conf.headers || EmptyObj),
        ...(req.headers || EmptyObj)
      };
    }

    return chain.proceed({
      url: req.url || "",
      method: req.method || "",
      data: req.data,
      headers: headers,
      extraData: req.extraData
    });
  }
  /**
   * 创建请求函数
   */


  createHandler(reqOpt) {
    let handler = req => {
      let url, method, data, headers, coverHeaders, extraData;
      method = reqOpt.method;

      if (req) {
        url = handler.getUrl(req.params);
        data = req.data;
        headers = req.headers;
        coverHeaders = req.coverHeaders;
        extraData = req.extraData;
      } else {
        url = handler.getUrl();
      }

      return this.request({
        url: url,
        method: method,
        data: data,
        headers: headers,
        coverHeaders: coverHeaders,
        extraData: extraData
      });
    };

    handler.getUrl = function (data) {
      let url = reqOpt.createUrl(data);
      return url;
    };

    return handler;
  }

}

Object.defineProperty(EasyHttp.prototype, "addRequests", {
  configurable: false,
  enumerable: false,
  get: function () {
    return function (requests) {
      if (!requests) {
        return this;
      }

      for (let key in requests) {
        let reqOpt = new RequestOption(this[pri$3].conf.getter, requests[key]);
        Object.defineProperty(this, key, {
          get: function () {
            return this.createHandler(reqOpt);
          }
        });
      }

      return this;
    }.bind(this);
  }
});
/**
 * 对外配置方法注册为静态和非静态两种方式
 */

const funcs = ["init", "setBaseUrl", "setDefaultMethod", "setDictate", "setHeaders", "addHeaders", "removeHeaders", "setRequestHandler", "setInterceptor", "addInterceptor", "setDictateHandler", "addDictateHandler", "removeDictateHandler", "setSerializater"];
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
        this[pri$3].conf[key](...arguments);
        return this;
      }.bind(this);
    }
  });
}

module.exports = EasyHttp;
