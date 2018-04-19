import Logger from "./utils/Logger.js";
const reg = /(?:\[([^{[]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^}\]]*)\])?/gi;

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
    Symbol("logConfig")
];
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
                        Logger.i(value);
                        return _resolve(value);
                    }
                    function reject(reason) {
                        Logger.e(reason);
                        return handleCatch ? _reject(reason) : false;
                    }
                    let url = this.getUrl(data);
                    i("EasyHttp-Url", url);
                    let actionName = (src.action || "").toLowerCase();
                    let action =
                        (this[actionMap] && this[actionMap][actionName]) ||
                        (EasyHttp[actionMap] &&
                            EasyHttp[actionMap][actionName]);
                    if (!action) {
                        let msg = src.action
                            ? "not found the action:'" + src.action + "'"
                            : "not found default action";
                        reject(msg);
                    } else if (!is(action, Function)) {
                        let msg = src.action
                            ? "the action:'" + src.action + "' is not Function"
                            : "default action is not Function";
                        reject(msg);
                        return;
                    } else {
                        action(resolve, reject, url);
                    }
                }.bind(handler)
            );
            return promise;
        };
        let getUrl = function(data) {
            let qStr = parentObj[analysis](src, item.matchsArray, data);
            let url = parentObj[baseUrl] + qStr;
            return url;
        };
        Object.defineProperty(handler, "getUrl", {
            get: function() {
                return getUrl;
            }
        });
        let header = function(header) {
            this.header = header;
            return this;
        }.bind(handler);
        Object.defineProperty(handler, "header", {
            get: function() {
                return header;
            }
        });
        let defCatchHandler = function() {
            handleCatch = true;
            if (arguments && arguments.length > 0) {
                return this(...arguments);
            } else {
                return this;
            }
        }.bind(handler);
        Object.defineProperty(handler, "c", {
            get: function() {
                return defCatchHandler;
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

    bindAction(actionName, action) {
        actionName || (actionName = "");
        this[actionMap] || (this[actionMap] = {});
        if (!action) {
            return;
        }
        this[actionMap][actionName.toLowerCase()] = action;
    }

    bindDictate(dictate, handler) {
        this[dictateMap] || (this[dictateMap] = {});
        if (!dictate || !handler) {
            return;
        }
        this[dictateMap][dictate.toLowerCase()] = handler;
    }

    setSerializater(_serializater) {
        this[serializater] = _serializater;
    }

    addProcessor(..._processors) {
        this[processors] || (this[processors] = new Array());
        if (!_processors) {
            return;
        }
        this[processors].push(..._processors);
    }
    use(plugin) {
        if (plugin && plugin.install && is(plugin.install, Function)) {
            plugin.install(this);
        }
    }

    static bindAction(actionName, action) {
        actionName || (actionName = "");
        this[actionMap] || (this[actionMap] = {});
        if (!action) {
            return;
        }
        this[actionMap][actionName.toLowerCase()] = action;
    }

    static bindDictate(dictate, handler) {
        this[dictateMap] || (this[dictateMap] = {});
        if (!dictate || !handler) {
            return;
        }
        this[dictateMap][dictate.toLowerCase()] = handler;
    }

    static setSerializater(_serializater) {
        this[serializater] = _serializater;
    }

    static addProcessor(..._processors) {
        this[processors] || (this[processors] = new Array());
        if (!_processors) {
            return;
        }
        this[processors].push(..._processors);
    }
    static use(plugin) {
        if (plugin && plugin.install && is(plugin.install, Function)) {
            plugin.install(this);
        }
    }
    static logConfig(_logConfig) {
        this[logConfig] = _logConfig;
    }
}
export default EasyHttp;
