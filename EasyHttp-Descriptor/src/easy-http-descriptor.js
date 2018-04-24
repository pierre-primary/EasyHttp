import { is } from "./utils/utils";
function setOption(obj, name, value) {
    if (!is(obj, Object)) {
        let u = target[key];
        obj = {};
        obj.urlFormat = u;
    }
    obj[name] = value;
}

export function action(value) {
    return function(target, key) {
        setOption(target[key], "action", value);
    };
}

export function escape(value) {
    return function(target, key) {
        setOption(target[key], "escape", value);
    };
}

export function dictate(value) {
    return function(target, key) {
        setOption(target[key], "dictate", value);
    };
}
