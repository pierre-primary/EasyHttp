//正则表达式-指令匹配
const REG = /(?:{([^{}]*))?{\s*([a-z_][a-z0-9_]*)\s*}(?:([^{}]*)})?/gi;
//结点类型
const NODE_TYPE = {
    TEXT: "text",
    CMD: "cmd"
};
//节点树
class ODL {
    static parse(tpl) {
        return new ODL(tpl);
    }
    constructor(tpl) {
        if (!tpl) {
            return;
        }
        let nodes = (this.nodes = []);
        let keys = (this.keys = {});
        let lastIndex = 0;
        let result;
        while ((result = REG.exec(tpl))) {
            let index = result["index"];
            if (lastIndex < index) {
                nodes.push({
                    type: NODE_TYPE.TEXT,
                    data: tpl.substring(lastIndex, index)
                });
            }
            let key = result[2];
            nodes.push({
                type: NODE_TYPE.CMD,
                data: {
                    key: key,
                    prefix: result[1] || undefined,
                    suffix: result[3] || undefined
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
    //转为模板
    toString() {
        if (!this.nodes) return "";
        let nodes = this.nodes;
        let tpl = "";
        let cmd, data;
        nodes.forEach(node => {
            data = node.data;
            switch (node.type) {
                case NODE_TYPE.CMD:
                    cmd = `{${data.key}}`;
                    if (data.prefix || data.suffix) {
                        cmd = `{${data.prefix || ""}${cmd}${data.suffix ||
                            ""}}`;
                    }
                    break;
                case NODE_TYPE.TEXT:
                default:
                    cmd = data;
            }
            tpl = tpl + cmd;
        });
        return tpl;
    }
}
module.exports = ODL;
module.exports.default = ODL;
module.exports.NODE_TYPE = NODE_TYPE;
