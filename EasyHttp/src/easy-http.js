import Logger from "./utils/Logger.js";

//匹配规则
const reg = /(?:\[([^{[]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^}\]]*)\])?/gi;

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
    logConfig
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
    Symbol("logConfig")
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
    Logger.e("EasyHttp-Error", (reason && reason.toString()) || reason);
}

class EasyHttp {
    constructor(_baseUrl, obj) {
        this[baseUrl] = _baseUrl;
        if (obj) {
            this[src] = {};
            for (let key in obj) {
                this[src][key] = this[createSrc](obj[key]);
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
                urlFormat: obj.urlFormat || obj.u
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

    [getRequestItem](key) {
        this[requests] || (this[requests] = {});
        if (key in this[src] && !(key in this[requests])) {
            this[requests][key] = this[createRequestItem](this[src][key]);
        }
        return this[requests] && this[requests][key];
    }

    [createRequestItem](src) {
        let item = {};
        let result;
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
            item.matchsArray || (item.matchsArray = new Array());
            item.matchsArray.push(matchs);
        }
        let parentObj = this;
        Object.defineProperty(item, "handler", {
            get: function() {
                return parentObj[createHandler](src, item);
            }
        });
        return item;
    }

    [createHandler](src, item) {
        let parentObj = this;
        let handleCatch = false;
        let handler = function(data) {
            let promise = new Promise(
                function(_resolve, _reject) {
                    function resolve(value) {
                        Logger.i(
                            "EasyHttp-Response",
                            (value && value.data != undefined && value.data) ||
                                value
                        );
                        return _resolve(value);
                    }
                    function reject(reason) {
                        if (handleCatch) {
                            return _reject(reason);
                        } else {
                            let eHandler =
                                parentObj[errorHandler] ||
                                EasyHttp[errorHandler] ||
                                defErrorHandler;
                            return eHandler(reason);
                        }
                    }
                    let url = this.getUrl(data);
                    Logger.i("EasyHttp-Url", url);
                    let actionName = (src.action || "").toLowerCase();
                    let action =
                        (this[actionMap] && this[actionMap][actionName]) ||
                        (EasyHttp[actionMap] &&
                            EasyHttp[actionMap][actionName]);
                    if (!action) {
                        let msg = actionName
                            ? "not found the action:'" + actionName + "'"
                            : "not found default action";
                        Logger.w(msg);
                    } else if (!is(action, Function)) {
                        let msg = actionName
                            ? "the action:'" + actionName + "' is not Function"
                            : "default action is not Function";
                        Logger.w(msg);
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
                    let qStr = parentObj[analysis](src, item.matchsArray, data);
                    let url = parentObj[baseUrl] + qStr;
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

    [analysis](src, matchsArray, data) {
        let urlFormat = src.urlFormat;
        if (matchsArray) {
            data || (data = {});
            matchsArray.forEach(match => {
                let key = match.key;
                let value = data[key];
                let szr =
                    this[serializater] ||
                    EasyHttp[serializater] ||
                    defSerializater;
                value = szr(value);
                let dictate = match.dictate || src.dictate;
                if (dictate) {
                    dictate.forEach(e => {
                        let dictateHandler =
                            (this[dictateMap] && this[dictateMap][e]) ||
                            (EasyHttp[dictateMap] && EasyHttp[dictateMap][e]);
                        if (dictateHandler) {
                            value = dictateHandler(value);
                        }
                    });
                } else {
                    let processors = this[processors] || EasyHttp[processors];
                    if (processors) {
                        processors.forEach(p => {
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

    static logConfig(_logConfig) {
        this[logConfig] = _logConfig;
    }
}

/**
 * 外部配置方法
 */
const funcs = {
    bindAction: function(actionName, action) {
        actionName || (actionName = "");
        this[actionMap] || (this[actionMap] = {});
        if (!action) {
            return;
        }
        this[actionMap][actionName.toLowerCase()] = action;
    },

    bindDictate: function(dictate, handler) {
        this[dictateMap] || (this[dictateMap] = {});
        if (!dictate || !handler) {
            return;
        }
        this[dictateMap][dictate.toLowerCase()] = handler;
    },

    setSerializater: function(_serializater) {
        this[serializater] = _serializater;
    },

    setErrorHandler: function(_errorHandler) {
        this[errorHandler] = _errorHandler;
    },

    addProcessor: function(..._processors) {
        this[processors] || (this[processors] = new Array());
        if (!_processors) {
            return;
        }
        this[processors].push(..._processors);
    },
    use: function(plugin) {
        if (plugin && plugin.install && is(plugin.install, Function)) {
            plugin.install(this);
        }
    }
};

/**
 * 外部配置方法注册为静态和非静态两种方式
 */
for (let key in funcs) {
    Object.defineProperty(EasyHttp, key, {
        get: function() {
            return function() {
                funcs[key].apply(this, arguments);
            }.bind(this);
        }
    });

    Object.defineProperty(EasyHttp.prototype, key, {
        get: function() {
            return function() {
                funcs[key].apply(this, arguments);
            }.bind(this);
        }
    });
}

export default EasyHttp;
