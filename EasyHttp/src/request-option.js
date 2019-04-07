import { is } from "./utils/utils";
import ODLUtils from "./odl/odl-utils";
import ODL, { NODE_TYPE } from "./odl/odl";

const pri = Symbol("privateScope");

export default class RequestOption {
    constructor(configGetter, obj) {
        this[pri] = { configGetter: configGetter };
        if (obj) {
            if (is(obj, Object)) {
                let temp;
                (temp = obj.action || obj.a) && (this[pri].action = temp);
                (temp = obj.urlFormat || obj.u) && (this[pri].urlFormat = temp);
                this[pri].dictates = ODLUtils.initDictate(obj.dictate || obj.d);
            } else {
                this[pri].urlFormat = obj;
            }
        }
    }

    get conf() {
        return this[pri].configGetter;
    }

    get action() {
        return this[pri].action || this.conf.action;
    }

    get urlFormat() {
        return this[pri].urlFormat;
    }

    get dictates() {
        return this[pri].dictates || this.conf.dictates;
    }

    get odl() {
        if (!("odl" in this[pri])) {
            this[pri].odl = (this.urlFormat && new ODL(this.urlFormat)) || undefined;
        }
        return this[pri].odl;
    }

    createUrl(data) {
        let nodes = this.odl.nodes;
        data = { ...(data || {}) };
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

                    val = dictateHandle(val, cmdData.dictates);
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
            val = dictateHandle(val);
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
        val = this.conf.serializater(val);
        dictates || (dictates = this.dictates);
        if (dictates) {
            dictates.forEach(dictateName => {
                let dictateHandler = this.conf.getDictateHandler(dictateName);
                dictateHandler && (val = dictateHandler(val));
            });
        }
        return val;
    }
}
