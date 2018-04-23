/**
 * 判断对象类型 （无法区分Function Is Object）
 *
 * @param {any} value
 * @param {any} type
 * @returns
 */
export function is(value, type) {
    // 先处理null和undefined
    if (value == undefined) {
        return value === type;
    }
    // instanceof 判断继承
    return value.constructor === type || value instanceof type;
}
