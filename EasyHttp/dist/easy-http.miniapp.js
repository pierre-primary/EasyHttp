/*
* easy-http v1.0.3
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

var ODLUtils = {
  initDictate(dictateStr) {
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

};

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
      let dictates = ODLUtils.initDictate(result[3]) || undefined;
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
      configGetter: configGetter
    };

    if (obj) {
      if (is(obj, Object)) {
        let temp;
        (temp = obj.action || obj.a) && (this[pri$1].action = temp);
        (temp = obj.urlFormat || obj.u) && (this[pri$1].urlFormat = temp);
        (temp = obj.dictate || obj.d) && (this[pri$1].requestDictate = temp);
      } else {
        this[pri$1].urlFormat = obj;
      }
    }
  }

  get conf() {
    return this[pri$1].configGetter;
  }

  get action() {
    return this[pri$1].action;
  }

  get urlFormat() {
    return this[pri$1].urlFormat;
  }

  get requestDictate() {
    return this[pri$1].requestDictate;
  }

  get odl() {
    if (!(["odl"] in this[pri$1])) {
      this[pri$1].odl = this.urlFormat && new ODL(this.urlFormat) || undefined;
    }

    return this[pri$1].odl;
  }
  /**
   * 参数解析
   */


  analysis(data) {
    let nodes = this.odl.nodes;
    data = { ...(data || {})
    };
    let urlFormat = "";

    for (let i = 0, n = nodes.length; i < n; i++) {
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
          let szr = this.serializater;
          val = szr(val);

          if (cmdData.dictates) {
            cmdData.dictates.forEach(e => {
              let hd = this.dictateMap(e);

              if (hd) {
                val = hd(val);
              }
            });
          }

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

}

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
          header: options.header ? { ...handler.getHeader(),
            ...options.header
          } : handler.getHeader()
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
      header = h ? { ...h
      } : null;
      return handler;
    };

    handler.addHeader = function (h) {
      if (!h) {
        return handler;
      }

      header = { ...this.getHeader(),
        ...h
      };
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

const DefaultAction = "get";

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
    this.setAction(options.action);
    this.setDictate(options.dictate);
    this.setHeaders(options.headers);
    this.setRequestHandler(options.requestHandler);
    this.setPreInterceptor(options.preInterceptors);
    this.setPostInterceptor(options.postInterceptors);
    this.setSerializater(options.serializater);
  }

  setBaseUrl(baseUrl) {
    this[pri$2].baseUrl = baseUrl || undefined;
    return this;
  }

  setAction(action) {
    this[pri$2].action = action;
    return this;
  }

  setDictate(dictateStr) {
    this[pri$2].dictates = ODLUtils.initDictate(dictateStr);
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

  setPreInterceptor(...preInterceptors) {
    if (preInterceptors && preInterceptors.length > 0) {
      this[pri$2].preInterceptors = [...preInterceptors];
    } else {
      this[pri$2].preInterceptors = null;
    }
  }

  addPreInterceptor(...preInterceptors) {
    if (preInterceptors && preInterceptors.length > 0) {
      this[pri$2].preInterceptors || (this[pri$2].preInterceptors = []);
      this[pri$2].preInterceptors.push(...preInterceptors);
    }

    return this;
  }

  setPostInterceptor(...postInterceptors) {
    if (postInterceptors && postInterceptors.length > 0) {
      this[pri$2].postInterceptors = [...postInterceptors];
    } else {
      this[pri$2].postInterceptors = undefined;
    }

    return this;
  }

  addPostInterceptor(...postInterceptors) {
    if (postInterceptors && postInterceptors.length > 0) {
      this[pri$2].postInterceptors || (this[pri$2].postInterceptors = []);
      this[pri$2].postInterceptors.push(...postInterceptors);
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
  /**
   * 插件安装
   */


  use(plugin) {
    plugin.install(this);
    return this;
  }

}

const Conf = new Configure();
class ConfigureGetter extends Configure {
  get configureGetter() {
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

        dictateMap(dictateName) {
          return this[pri$2].dictateHandlers && this[pri$2].dictateHandlers[dictateName] || Conf[pri$2].dictateHandlers && Conf[pri$2].dictateHandlers[dictateName];
        }

      };
    }
  }

}

const [rqots, rqers, in_conf, getRequestItem] = [Symbol("requestOptions"), Symbol("requesters"), Symbol("configure"), Symbol("getRequestItem")];

class EasyHttp {
  constructor(baseUrl, requests) {
    this[in_conf] = new ConfigureGetter();
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
          this[rqots][key] = new RequestOption(this[in_conf].configureGetter, requests[key]);
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

const funcs = ["init", "setBaseUrl", "setAction", "setDictate", "setHeaders", "addHeaders", "removeHeaders", "setRequestHandler", "setPreInterceptor", "addPreInterceptor", "setPostInterceptor", "addPostInterceptor", "setDictateHandler", "addDictateHandler", "removeDictateHandler", "setSerializater"];
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
