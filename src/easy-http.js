const reg = /(?:\[([^{\[]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^}\]]*)\])?/gi;

class EasyHttp {
    constructor(baseUrl, obj) {
        this.baseUrl = baseUrl;
        if (obj) {
            this.src = {};
            for (let key in obj) {
                this.src[key] = obj[key];
                Object.defineProperty(this, key, {
                    get: function() {
                        let item = this.getRequestItem(key);
                        return item && item.handler;
                    }
                });
            }
        }
    }

    getRequestItem(key) {
        this.requests || (this.requests = {});
        if (key in this.src && !(key in this.requests)) {
            this.requests[key] = this.createRequestHandler(this.src[key]);
        }
        return this.requests && this.requests[key];
    }
    createRequestHandler(urlFormat) {
        let item = {};
        let result;
        while ((result = reg.exec(urlFormat)) != null) {
            let match = result[0];
            let prefix = result[1];
            let suffix = result[4];
            let key = result[2];
            let dictate;
            if (result[3]) {
                let _dictate = result[3].split(":");
                _dictate.forEach(e => {
                    if (e) {
                        dictate || (dictate = new Array());
                        dictate.push(e);
                    }
                });
            }
            item.matchsMap || (item.matchsMap = {});
            item.matchsMap[key] = {
                match,
                prefix,
                suffix,
                dictate
            };
        }
        let parentObj = this;
        item.handler = function(data) {
            return new Promise(function(resolve, reject) {
                let qStr = parentObj.analysis(urlFormat, item.matchsMap, data);
                let url = parentObj.baseUrl + qStr;
                resolve(url);
            });
        };
        return item;
    }
    analysis(urlFormat, matchsMap, data) {
        if (matchsMap && data) {
            for (let key in matchsMap) {
                let match = matchsMap[key];
                let value = data[key];
                if (match.dictate) {
                    match.dictate.forEach(e => {
                        var dictateHandler =
                            (this.dictateMap && this.dictateMap[e]) ||
                            (EasyHttp.dictateMap && EasyHttp.dictateMap[e]);
                        if (dictateHandler) {
                            value = dictateHandler(value);
                        }
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
    bindDictate(dictate, handler) {
        if (!dictate || !handler) {
            return;
        }
        this.dictateMap || (this.dictateMap = {});
        this.dictateMap[dictate] = handler;
    }
    unBindDictate(dictate) {
        dictate &&
            this.dictateMap &&
            dictate in this.dictateMap &&
            delete this.dictateMap[dictate];
    }
    static bindAction(dictate, handler) {
        if (!dictate || !handler) {
            return;
        }
        EasyHttp.dictateMap || (EasyHttp.dictateMap = {});
        EasyHttp.dictateMap[dictate] = handler;
    }
    static unBindAction(dictate) {
        dictate &&
            EasyHttp.dictateMap &&
            dictate in EasyHttp.dictateMap &&
            delete EasyHttp.dictateMap[dictate];
    }
    static bindDictate(dictate, handler) {
        if (!dictate || !handler) {
            return;
        }
        EasyHttp.dictateMap || (EasyHttp.dictateMap = {});
        EasyHttp.dictateMap[dictate] = handler;
    }
    static unBindDictate(dictate) {
        dictate &&
            EasyHttp.dictateMap &&
            dictate in EasyHttp.dictateMap &&
            delete EasyHttp.dictateMap[dictate];
    }

    static addDefProcessor(index, ...processors) {
        if (!processors) {
            return;
        }
        EasyHttp.preprocessors || (EasyHttp.preprocessors = new Array());
        EasyHttp.preprocessors.push(processors);
    }
}
//
var ggg = new EasyHttp("http://test.com", {
    gg: null,
    gg2: "/{a}/{b:j:u:b}/[act/{c:hhh}/act/]",
    gg3: "/1"
});
var i = ggg.gg2({ a: 1, b: 2, c: 3 }).then(e => {
    console.log(e);
});
i = ggg.gg().then(e => {
    console.log(e);
});
i = ggg.gg3().then(e => {
    console.log(e);
});
