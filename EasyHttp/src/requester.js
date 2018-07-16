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
        let handler = function (options) {
            let promise = new Promise((resolve, reject) => {
                let url = handler.getUrl(options && options.params);
                let actionName = $slef.ro.action;
                let request = {
                    url,
                    params: options && options.params,
                    action: actionName,
                    data: options && options.data,
                    other: options && options.other,
                    header: handler.getHeader()
                };
                let hd = $slef.ro.handler;
                if (hd) {
                    let prhds = $slef.ro.preHandlers;
                    if (prhds && prhds.length > 0) {
                        for (let i = 0, len = prhds.length; i < len; i++) {
                            if (prhds[i](request, resolve, reject)) {
                                return;
                            }
                        }
                    }
                    try {
                        hd(request).then(resp => {
                            resolve({
                                request,
                                response: resp
                            });
                        }).catch(resp => {
                            reject({
                                errType: 0,
                                request,
                                response: resp
                            });
                        });
                    } catch (e) {
                        reject({
                            errType: -1,
                            request,
                            msg: e
                        });
                    }
                } else {
                    reject({
                        errType: -1,
                        request,
                        msg: "not found handler"
                    });
                }
            });
            let pohds = $slef.ro.postHandlers;
            if (pohds && pohds.length > 0) {
                return Promise.resolve().then(() => {
                    let _p = promise;
                    for (let i = 0, len = pohds.length; i < len; i++) {
                        _p = pohds[i](_p);
                    }
                    return _p;
                });
            } else {
                return promise;
            }
        };
        handler.setHeader = function (_h) {
            header = { ..._h
            };
            return handler;
        };
        handler.addHeader = function (_h) {
            header = { ...this.getHeader(),
                ..._h
            };
            return handler;
        };
        handler.getHeader = function () {
            return handler.header || $slef.ro.header || {};
        };
        handler.getUrl = function (data) {
            let url = $slef.ro.analysis(data);
            return url;
        };
        return handler;
    }
}
