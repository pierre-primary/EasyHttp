import { is } from "./utils/utils";
import Logger from "./utils/logger";
import { UseConfigureImpt } from "./configure";

function defErrorHandler(reason) {
    Logger.e("EasyHttp-ResponseError", (reason && reason.toString()) || reason);
}

export default class Requester extends UseConfigureImpt {
    constructor(conf, requestOption) {
        super(conf);
        this.ro = requestOption;
    }

    get handler() {
        return this.createHandler();
    }

    /**
     * 创建请求函数
     */
    createHandler() {
        let parentObj = this;
        let config;
        let handler = function(data) {
            let promise = new Promise(
                function(_resolve, _reject) {
                    function resolve(value) {
                        Logger.i("\nEasyHttp-Response", (value && value.data != undefined && value.data) || value);
                        return _resolve(value);
                    }
                    function reject(reason) {
                        if (config && config.handleCatch) {
                            return _reject(reason);
                        } else {
                            let eHandler = parentObj.errorHandler || defErrorHandler;
                            return eHandler(reason);
                        }
                    }
                    let url = this.getUrl(data);
                    Logger.i("EasyHttp-Url", url);
                    let actionName = parentObj.ro.action;
                    let action = parentObj.actionMap(actionName);
                    if (!action) {
                        let msg = actionName ? "not found the action:'" + actionName + "'" : "not found default action";
                        Logger.w("EasyHttp", msg);
                    } else if (!is(action, Function)) {
                        let msg = actionName
                            ? "the action:'" + actionName + "' is not Function"
                            : "default action is not Function";
                        Logger.w("EasyHttp", msg);
                    } else {
                        action(resolve, reject, url);
                    }
                }.bind(handler)
            );
            return promise;
        };
        handler.getUrl = function(data) {
            let url = parentObj.ro.analysis(data);
            return url;
        };
        handler.config = function(_config) {
            config = _config;
            return handler;
        };
        return handler;
    }
}
