import ODLUtils from "./odl-utils";

//正则表达式-指令匹配
const REG = /(?:{([^{}]*))?{\s*([a-z_][a-z0-9_]*)\s*((?::[a-z_][a-z0-9_]*)*)\s*}(?:([^{}]*)})?/gi;
//结点类型
export const NODE_TYPE = {
    TEXT: "text",
    CMD: "cmd"
};
const pri = Symbol("privateScope");
//节点树
class ODLConstructor {
    constructor(requestTpl) {
        this[pri] = {};
        let tpl = requestTpl;
        if (!tpl) {
            return;
        }
        let nodes = (this[pri].nodes = []);
        let keys;
        let lastIndex = 0;
        let result;
        while ((result = REG.exec(tpl))) {
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
    }
    //转为请求模板
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
export default ODL;
