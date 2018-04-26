import { is } from "./utils/utils";
import { UseConfigureImpt } from "./configure";

//匹配规则
const reg = /(?:\[([^[{]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^}\]]*)\])?/gi;

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

function defSerializater(value) {
    if (is(value, Object)) {
        value = JSON.stringify(value);
    }
    return value;
}

export default class RequestOption extends UseConfigureImpt {
    constructor(conf, obj) {
        super(conf);
        if (obj) {
            if (is(obj, Object)) {
                (obj.action || obj.a) && (this.action = obj.action || obj.a);
                (obj.urlFormat || obj.u) && (this._urlFormat = obj.urlFormat || obj.u);
                (obj.escape || obj.esc) && (this.escape = obj.escape || obj.esc);
                this.dictate = obj.dictate || obj.d;
            } else {
                this._urlFormat = obj;
            }
        }
    }

    get urlFormat() {
        return this._urlFormatHold || this._urlFormat;
    }

    reSetUrlFormat() {
        if (this.escape) {
            this._urlFormatHold || (this._urlFormatHold = hold(this._urlFormat));
        } else {
            this._urlFormatHold && delete this._urlFormatHold;
        }
        this.makeMatchsMap();
    }

    makeMatchsMap() {
        if (!this.matchsMap || this._matchsUrl !== this.urlFormat) {
            this.matchsMap = {};
            this._matchsUrl = this.urlFormat;
            let result;
            while ((result = reg.exec(this._matchsUrl)) != null) {
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
                this.matchsMap[matchs.key] = matchs;
            }
        }
        return this.matchsMap;
    }

    recoverUrl(url) {
        if (this._urlFormatHold) {
            return unHold(url);
        }
        return url;
    }
    /**
     * 参数解析
     */
    analysis(data) {
        this.reSetUrlFormat();
        data || (data = {});
        let query;
        let urlFormat = this.urlFormat;
        let matchsMap = this.matchsMap;
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
            let szr = this.serializater || defSerializater;
            value = szr(value);
            let dictate = (match && match.dictate) || this.dictate;
            if (dictate) {
                dictate.forEach(e => {
                    let dictateHandler = this.dictateMap(e);
                    if (dictateHandler) {
                        value = dictateHandler(value);
                    }
                });
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

        urlFormat = urlFormat ? this.recoverUrl(urlFormat) : "";
        let url = this.baseUrl + urlFormat;
        if (query) {
            url += (url.indexOf("?") < 0 ? "?" : "&") + query;
        }
        return url;
    }
}
