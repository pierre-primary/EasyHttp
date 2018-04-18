const reg = /(?:\[([^{[]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^}\]]*)\])?/gi;

function is(value, type) {
    // 先处理null和undefined
    if (value == null) {
        return value === type;
    }
    // instanceof 判断继承
    return value.constructor === type || value instanceof type;
}
class EasyHttp {
    constructor(baseUrl, obj) {
        this.baseUrl = baseUrl;
        if (obj) {
            this.src = {};
            for (let key in obj) {
                this.src[key] = this.createSrc(obj[key]);
                Object.defineProperty(this, key, {
                    get: function() {
                        let item = this.getRequestItem(key);
                        return item && item.handler;
                    }
                });
            }
        }
    }

    createSrc(obj) {
        let src;
        if (obj && is(obj, Object)) {
            src = {
                action: obj.action,
                urlFormat: obj.urlFormat
            };
            if (obj.dictate) {
                let _dictate = obj.dictate.split(":");
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

    getRequestItem(key) {
        this.requests || (this.requests = {});
        if (key in this.src && !(key in this.requests)) {
            this.requests[key] = this.createRequestItem(this.src[key]);
        }
        return this.requests && this.requests[key];
    }

    createRequestItem(src) {
        let item = {};
        let result;
        while ((result = reg.exec(src.urlFormat)) != null) {
            var key = result[2];
            let matchs = {
                match: result[0],
                prefix: result[1],
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
            item.matchsMap[key] = matchs;
        }
        let parentObj = this;
        Object.defineProperty(item, "handler", {
            get: function() {
                return parentObj.createHandler(src, item);
            }
        });
        return item;
    }

    createHandler(src, item) {
        let parentObj = this;
        let handler = function(data) {
            return new Promise(
                function(resolve, reject) {
                    let url = this.getUrl(data);
                    var action =
                        EasyHttp.actionMap &&
                        (EasyHttp.actionMap[src.action || ""] ||
                            EasyHttp.actionMap[""]);
                    if (action) {
                        action(resolve, reject, url);
                    } else {
                        let msg = src.action
                            ? "not found the action:'" + src.action + "'"
                            : "not found default action";
                        reject(msg);
                    }
                }.bind(handler)
            );
        };
        let getUrl = function(data) {
            let qStr = parentObj.analysis(src, item.matchsMap, data);
            let url = parentObj.baseUrl + qStr;
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
        return handler;
    }

    analysis(src, matchsMap, data) {
        let urlFormat = src.urlFormat;
        if (matchsMap) {
            data || (data = {});
            for (let key in matchsMap) {
                let match = matchsMap[key];
                let value = data[key];
                let dictate = match.dictate || src.dictate;
                if (dictate) {
                    dictate.forEach(e => {
                        var dictateHandler =
                            EasyHttp.dictateMap && EasyHttp.dictateMap[e];
                        if (dictateHandler) {
                            value = dictateHandler(value);
                        }
                    });
                } else if (EasyHttp.processors) {
                    EasyHttp.processors.forEach(p => {
                        value = p(value);
                    });
                }
                if (value) {
                    value = (match.prefix || "") + value + (match.suffix || "");
                } else {
                    value = "";
                }
                urlFormat = urlFormat.replace(match.match, value);
            }
        }
        urlFormat || (urlFormat = "");
        return urlFormat;
    }

    static bindAction(actionName, action) {
        if (!action) {
            return;
        }
        EasyHttp.actionMap || (EasyHttp.actionMap = {});
        EasyHttp.actionMap[actionName || ""] = action;
    }

    static bindDictate(dictate, handler) {
        if (!dictate || !handler) {
            return;
        }
        EasyHttp.dictateMap || (EasyHttp.dictateMap = {});
        EasyHttp.dictateMap[dictate] = handler;
    }

    static addDefProcessor(...processors) {
        if (!processors) {
            return;
        }
        EasyHttp.processors || (EasyHttp.processors = new Array());
        EasyHttp.processors.push(...processors);
    }
}
export default EasyHttp;
