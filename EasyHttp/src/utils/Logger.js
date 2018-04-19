export default {
    i(key, str) {
        console.log(key + ":", str);
    },
    d(key, str) {
        console.debug(key + ":", str);
    },
    w(key, str) {
        console.warn(key + ":", str);
    },
    e(key, str) {
        console.error(key + ":", str);
    }
};
