export default class Requester {
    constructor(requestOption) {
        this.ro = requestOption;
    }

    get handler() {
        return this.createHandler();
    }

    /**
     * 创建请求函数
     */
    createHandler() {
        let $slef = this;
        let handler = function(options) {
            let promise = new Promise((resolve, reject) => {
                let url = handler.getUrl(options && options.params);
                let actionName = $slef.ro.action;
                let request = {
                    url,
                    action: actionName,
                    data: options && options.data,
                    other: options && options.other,
                    header: handler.getHeader()
                };
                function complete(code, data, header, msg) {
                    resolve({
                        request,
                        response: {
                            code,
                            data,
                            header,
                            msg
                        }
                    });
                }
                function error(code, data, header, msg) {
                    reject({
                        request,
                        response: {
                            code,
                            data,
                            header,
                            msg
                        }
                    });
                }
                let hd = $slef.ro.handler;
                if (hd) {
                    let prhds = $slef.ro.preHandlers;
                    if (prhds && prhds.length > 0) {
                        for (let i = 0, len = prhds.length; i < len; i++) {
                            if (prhds[i](request, complete, error)) {
                                return;
                            }
                        }
                    }
                    hd(request, complete, error);
                } else {
                    error(0, null, null, "not found handler");
                }
            });
            let pohds = $slef.ro.postHandlers;
            if (pohds && pohds.length > 0) {
                return Promise.resolve().then(() => {
                    for (let i = 0, len = pohds.length; i < len; i++) {
                        pohds[i](promise);
                    }
                    return promise;
                });
            } else {
                return promise;
            }
        };
        handler.setHeader = function(_h) {
            header = { ..._h };
            return handler;
        };
        handler.addHeader = function(_h) {
            header = { ...this.getHeader(), ..._h };
            return handler;
        };
        handler.getHeader = function() {
            return handler.header || $slef.ro.header || {};
        };
        handler.getUrl = function(data) {
            let url = $slef.ro.analysis(data);
            return url;
        };
        return handler;
    }
}
