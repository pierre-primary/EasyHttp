export default {
    initDictate(dictateStr) {
        if (dictateStr) {
            let dictates;
            let cmds = dictateStr.split(":");
            for (let i = 0, n = cmds.length; i < n; i++) {
                let e = cmds[i];
                if (e) {
                    (dictates || (dictates = [])).push(e);
                }
            }
            return dictates;
        }
    }
};
