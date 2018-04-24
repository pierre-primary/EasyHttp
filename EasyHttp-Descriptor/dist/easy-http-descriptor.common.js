/*!
* easy-http-descriptor.js v1.0.0
* (c) 2018-2018 PengYuan-Jiang
*/
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/**
 * 判断对象类型 （无法区分Function Is Object）
 *
 * @param {any} value
 * @param {any} type
 * @returns
 */
function is(value, type) {
    // 先处理null和undefined
    if (value == undefined) {
        return value === type;
    }
    // instanceof 判断继承
    return value.constructor === type || value instanceof type;
}

function setOption(obj, name, value) {
    if (!is(obj, Object)) {
        var u = target[key];
        obj = {};
        obj.urlFormat = u;
    }
    obj[name] = value;
}

function action(value) {
    return function (target, key) {
        setOption(target[key], "action", value);
    };
}

function escape(value) {
    return function (target, key) {
        setOption(target[key], "escape", value);
    };
}

function dictate(value) {
    return function (target, key) {
        setOption(target[key], "dictate", value);
    };
}

exports.action = action;
exports.escape = escape;
exports.dictate = dictate;
