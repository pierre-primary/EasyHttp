const reg = /(?:\[[^{]*)?({\s*([a-z_][a-z0-9_]*)((?::[a-z_][a-z0-9_]*)*)\s*})(?:[^}]*\])?/gi;

class EasyHttp {
    constructor(obj) {
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

    createRequestHandler(urlFormat) {
        let item;
        let matchsMap = {};
        let matchsArray = new Array();
        let result;
        while ((result = reg.exec(urlFormat)) != null) {
            let match = result[0];
            let variable = result[1];
            let key = result[2];
            let dictate = new Array();
            if (result[3]) {
                let _dictate = result[3].split(":");
                _dictate.forEach(e => {
                    if (e) {
                        dictate.push(e);
                    }
                });
            }
            matchsMap[result] = {
                match,
                variable,
                key,
                dictate,
                must: match == variable
            };
            matchsArray.push(matchsMap[result]);
        }
        item = {
            matchsMap,
            matchsArray
        };
        item.handler = function() {}.bind(item);
        return item;
    }

    getRequestItem(key) {
        this.requests || (this.requests = {});
        if (key in this.src && this.src[key]) {
            if (!(key in this.requests)) {
                this.requests[key] = this.createRequestHandler(this.src[key]);
            }
        }
        return this.requests && this.requests[key];
    }
}
var ggg = new EasyHttp({
    gg: "1",
    gg2: "http://www.baidu.com/{a}/{b:g:h:j}",
    gg3: "1"
});
var i = ggg.gg2;
i = ggg.gg;
i = ggg.gg3;
