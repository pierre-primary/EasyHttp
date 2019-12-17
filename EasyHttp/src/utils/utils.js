

let canUseProxy = undefined;
module.exports = {
    /**
     * 判断对象类型 （无法区分Function Is Object）
     *
     * @param {any} value
     * @param {any} type
     * @returns
     */
    is(value, type) {
        // 先处理null和undefined
        if (value == undefined) {
            return value === type;
        }
        // instanceof 判断继承
        return value.constructor === type || value instanceof type;
    },
    /**
     * @returns
     */
    isCanUseProxy() {
        if (canUseProxy !== undefined) {
            return canUseProxy
        }
        if (Proxy) {
            try {
                new Proxy({}, { get() { } });
                return canUseProxy = true;
            } catch (ex) {
            }
        }
        return canUseProxy = false;
    }
}
