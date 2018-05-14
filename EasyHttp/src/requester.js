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
                    function resolve(value) {
                        console.log(`EasyHttp-Url: [${actionName}]${url}`);
                        console.log(
                            "EasyHttp-Respons: ",
                            (value && value.data != undefined && value.data) || value,
                            "\n"
                        );
                        return _resolve(value);
                    }
                    function reject(reason) {
                        if (options && options.handleCatch) {
                            return _reject(reason);
                        } else if ($slef.ro.errorHandler) {
                            return $slef.ro.errorHandler(reason);
                        } else {
                            console.error(`EasyHttp-Url: [${actionName}]${url}`);
                            console.error("EasyHttp-ResponseError: ", (reason && reason.toString()) || reason, "\n");
                        }
                    }
                    let hd = $slef.ro.handler;
                    if (!hd) {
                        console.warn(`EasyHttp-Url: [${actionName}]${url}`);
                        console.warn("EasyHttp-Warn:", "not found handler", "\n");
                    } else {
                        hd({
                            resolve,
                            reject,
                            url,
                            action: actionName,
                            datas: options.datas,
                            handler: this.getHeaders()
                        });
                    }
                }.bind(handler)
            );
            return promise;
        };
        handler.setHeaders = function(_h) {
            headers = _h;
            return handler;
        };
        handler.addHeaders = function(_h) {
            headers = { ...this.getHeaders(), ..._h };
            return handler;
        };
        handler.getHeaders = function() {
            return handler.headers || $slef.ro.headers || {};
        };
        handler.getUrl = function(data) {
            let url = $slef.ro.analysis(data);
            return url;
        };
        return handler;
    }
}
