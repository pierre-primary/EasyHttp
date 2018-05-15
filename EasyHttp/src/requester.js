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
            let promise = new Promise(
                function(_resolve, _reject) {
                    let url = this.getUrl(options && options.params);
                    let actionName = $slef.ro.action;
                    let request = {
                        url,
                        action: actionName,
                        data: options && options.data,
                        other: options && options.other,
                        header: this.getHeader()
                    };
                    function complete(code, data, header, error) {
                        let response = {
                            code,
                            data,
                            header,
                            error
                        };
                        let pohds = $slef.ro.postHandlers;
                        if (pohds && pohds.length > 0) {
                            for (let i = 0, len = pohds.length; i < len; i++) {
                                if (pohds[i](request, response, _resolve, _reject)) {
                                    return false;
                                }
                            }
                        }
                        if (response.code > 0) {
                            return _resolve(response);
                        } else {
                            return _reject(response);
                        }
                    }
                    let hd = $slef.ro.handler;
                    if (!hd) {
                        console.warn(`EasyHttp-Url: [${actionName}]${url}`);
                        console.warn("EasyHttp-Warn:", "not found handler", "\n");
                    } else {
                        let prhds = $slef.ro.preHandlers;
                        if (prhds && prhds.length > 0) {
                            for (let i = 0, len = prhds.length; i < len; i++) {
                                if (prhds[i](request, complete)) {
                                    return;
                                }
                            }
                        }
                        hd(request, complete);
                        return;
                    }
                }.bind(handler)
            );
            return promise;
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
