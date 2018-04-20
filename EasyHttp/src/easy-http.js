import Logger from "./utils/Logger.js";

//匹配规则
const reg = /(?:\[([^[{]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^}\]]*)\])?/gi;

//私有属性名
const [
    createSrc,
    getRequestItem,
    createRequestItem,
    createHandler,
    analysis,
    baseUrl,
    src,
    requests,
    dictateMap,
    actionMap,
    serializater,
    processors,
    errorHandler,
    logConfig,
    isHold
] = [
    Symbol("createSrc"),
    Symbol("getRequestItem"),
    Symbol("createRequestItem"),
    Symbol("createHandler"),
    Symbol("analysis"),
    Symbol("baseUrl"),
    Symbol("src"),
    Symbol("requests"),
    Symbol("dictateMap"),
    Symbol("actionMap"),
    Symbol("serializater"),
    Symbol("processors"),
    Symbol("errorHandler"),
    Symbol("logConfig"),
    Symbol("isHold")
];
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
    Logger.e("EasyHttp-ResponseError", (reason && reason.toString()) || reason);
}

const HoldBL = "*:hold-bl:*";
const HoldBR = "*:hold-br:*";
const HoldML = "*:hold-ml:*";
const HoldMR = "*:hold-mr:*";
function hold(str) {
    if (!str) {
        return str;
    }
    return str
        .replace("\\{", HoldBL)
        .replace("\\}", HoldBR)
        .replace("\\[", HoldML)
        .replace("\\]", HoldMR);
}

function unHold(str) {
    if (!str) {
        return str;
    }
    return str
        .replace(HoldBL, "{")
        .replace(HoldBR, "}")
        .replace(HoldML, "[")
        .replace(HoldMR, "]");
}

class EasyHttp {
    constructor(_baseUrl, options) {
        this[baseUrl] = _baseUrl || "";
        if (options) {
            this[src] = {};
            for (let key in options) {
                this[src][key] = this[createSrc](options[key]);
                Object.defineProperty(this, key, {
                    get: function() {
                        let item = this[getRequestItem](key);
                        return item && item.handler;
                    }
                });
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
    [createSrc](obj) {
        let src;
        if (obj && is(obj, Object)) {
            src = {
                action: obj.action || obj.a,
                urlFormat: obj.urlFormat || obj.u,
                isHold: obj.hold || obj.h
            };
            let dictate = obj.dictate || obj.d;
            if (dictate) {
                let _dictate = dictate.split(":");
                _dictate.forEach(e => {
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
    [getRequestItem](key) {
        this[requests] || (this[requests] = {});
        if (key in this[src] && !(key in this[requests])) {
            this[requests][key] = this[createRequestItem](this[src][key]);
        }
        return this[requests] && this[requests][key];
    }

    /**
     * 创建请求项
     */
    [createRequestItem](src) {
        let item = {};
        let result;
        (src.isHold || this[isHold] || EasyHttp[isHold]) && (src.urlFormat = hold(src.urlFormat));
        while ((result = reg.exec(src.urlFormat)) != null) {
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
            item.matchsMap || (item.matchsMap = {});
            item.matchsMap[matchs.key] = matchs;
        }
        let parentObj = this;
        Object.defineProperty(item, "handler", {
            get: function() {
                return parentObj[createHandler](src, item);
            }
        });
        return item;
    }

    /**
     * 创建请求函数
     */
    [createHandler](src, item) {
        let parentObj = this;
        let handleCatch = false;
        let handler = function(data) {
            let promise = new Promise(
                function(_resolve, _reject) {
                    function resolve(value) {
                        Logger.i("\nEasyHttp-Response", (value && value.data != undefined && value.data) || value);
                        return _resolve(value);
                    }
                    function reject(reason) {
                        if (handleCatch) {
                            return _reject(reason);
                        } else {
                            let eHandler = parentObj[errorHandler] || EasyHttp[errorHandler] || defErrorHandler;
                            return eHandler(reason);
                        }
                    }
                    let url = this.getUrl(data);
                    Logger.i("EasyHttp-Url", url);
                    let actionName = (src.action || "get").toLowerCase();
                    let action =
                        (parentObj[actionMap] && parentObj[actionMap][actionName]) ||
                        (EasyHttp[actionMap] && EasyHttp[actionMap][actionName]);
                    if (!action) {
                        let msg = actionName ? "not found the action:'" + actionName + "'" : "not found default action";
                        Logger.w("EasyHttp", msg);
                    } else if (!is(action, Function)) {
                        let msg = actionName
                            ? "the action:'" + actionName + "' is not Function"
                            : "default action is not Function";
                        Logger.w("EasyHttp", msg);
                    } else {
                        action(resolve, reject, url);
                    }
                }.bind(handler)
            );
            return promise;
        };
        Object.defineProperty(handler, "getUrl", {
            get: function() {
                return function(data) {
                    let url = parentObj[analysis](src, item.matchsMap, data);
                    return url;
                };
            }
        });
        Object.defineProperty(handler, "header", {
            get: function() {
                return function(header) {
                    handler.header = header;
                    return handler;
                };
            }
        });
        Object.defineProperty(handler, "catch", {
            get: function() {
                return function(_handleCatch) {
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
    [analysis](src, matchsMap, data) {
        let urlFormat = src.urlFormat;
        let query;
        data || (data = {});
        matchsMap || (matchsMap = {});
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
            let szr = this[serializater] || EasyHttp[serializater] || defSerializater;
            value = szr(value);
            let dictate = (match && match.dictate) || src.dictate;
            if (dictate) {
                dictate.forEach(e => {
                    let dictateHandler =
                        (this[dictateMap] && this[dictateMap][e]) || (EasyHttp[dictateMap] && EasyHttp[dictateMap][e]);
                    if (dictateHandler) {
                        value = dictateHandler(value);
                    }
                });
            } else {
                let prs = this[processors] || EasyHttp[processors];
                if (prs) {
                    prs.forEach(p => {
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
                query || (query = "");
                query += (query ? "&" : "") + key + "=" + value;
            }
        }
        if (urlFormat) {
            urlFormat = src.isHold || this[isHold] || EasyHttp[isHold] ? unHold(urlFormat) : urlFormat;
        } else {
            urlFormat = "";
        }
        let url = this[baseUrl] + urlFormat;
        if (query) {
            url += (url.indexOf("?") < 0 ? "?" : "&") + query;
        }
        return url;
    }

    static logConfig(_logConfig) {
        this[logConfig] = _logConfig;
    }
}

/**
 * 外部配置方法
 */
const funcs = {
    /**
     *全局绑定事件 GET,POST 等
     */
    bindAction: function(actionName, action) {
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
    bindDictate: function(dictate, handler) {
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
    setSerializater: function(_serializater) {
        this[serializater] = _serializater;
        return this;
    },

    /**
     *绑定全局错误处理器
     */
    setErrorHandler: function(_errorHandler) {
        this[errorHandler] = _errorHandler;
        return this;
    },

    setIsHold: function(_isHold) {
        this[isHold] = _isHold;
        return this;
    },
    /**
     *添加参数预处理器
     */
    addProcessor: function(..._processors) {
        this[processors] || (this[processors] = new Array());
        if (!_processors) {
            return;
        }
        this[processors].push(..._processors);
        return this;
    },
    /**
     * 插件安装
     */
    use: function(plugin) {
        if (plugin && plugin.install && is(plugin.install, Function)) {
            plugin.install(this);
        }
        return this;
    }
};

/**
 * 外部配置方法注册为静态和非静态两种方式
 */
for (let key in funcs) {
    Object.defineProperty(EasyHttp, key, {
        get: function() {
            return function() {
                return funcs[key].apply(this, arguments);
            }.bind(this);
        }
    });

    Object.defineProperty(EasyHttp.prototype, key, {
        get: function() {
            return function() {
                return funcs[key].apply(this, arguments);
            }.bind(this);
        }
    });
}
export default EasyHttp;
