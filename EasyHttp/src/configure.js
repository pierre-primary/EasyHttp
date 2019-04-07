import { is } from "./utils/utils";
import ODLUtils from "./odl/odl-utils";

const DefaultAction = "get";
const DefaultSerializater = function(value) {
    if (is(value, Object)) {
        value = JSON.stringify(value);
    }
    return value;
};

const pri = Symbol("privateScope");

//可配置类基类
class Configure {
    constructor() {
        this[pri] = {};
    }

    init(options) {
        if (!options) {
            return;
        }
        this.setBaseUrl(options.baseUrl);
        this.setAction(options.action);
        this.setDictate(options.dictate);
        this.setHeaders(options.headers);
        this.setRequestHandler(options.requestHandler);
        this.setPreInterceptor(options.preInterceptors);
        this.setPostInterceptor(options.postInterceptors);
        this.setSerializater(options.serializater);
    }

    setBaseUrl(baseUrl) {
        this[pri].baseUrl = baseUrl || undefined;
        return this;
    }

    setAction(action) {
        this[pri].action = action;
        return this;
    }

    setDictate(dictateStr) {
        this[pri].dictates = ODLUtils.initDictate(dictateStr);
        return this;
    }

    setHeaders(headers) {
        if (headers) {
            this[pri].headers = { ...headers };
        } else {
            this[pri].headers = undefined;
        }
        return this;
    }

    addHeaders(headers) {
        if (!headers) {
            return this;
        }
        if (this[pri].headers) {
            this[pri].headers = { ...this[pri].headers, ...headers };
        } else {
            this[pri].headers = { ...headers };
        }
        return this;
    }

    removeHeaders(...names) {
        if (this[pri].headers && names && names.length > 0) {
            names.forEach(name => {
                name in this[pri].headers && delete this[pri].headers[name];
            });
        }
    }

    setRequestHandler(requestHandler) {
        this[pri].requestHandler = requestHandler || undefined;
        return this;
    }

    setPreInterceptor(...preInterceptors) {
        if (preInterceptors && preInterceptors.length > 0) {
            this[pri].preInterceptors = [...preInterceptors];
        } else {
            this[pri].preInterceptors = null;
        }
    }

    addPreInterceptor(...preInterceptors) {
        if (preInterceptors && preInterceptors.length > 0) {
            this[pri].preInterceptors || (this[pri].preInterceptors = []);
            this[pri].preInterceptors.push(...preInterceptors);
        }
        return this;
    }

    setPostInterceptor(...postInterceptors) {
        if (postInterceptors && postInterceptors.length > 0) {
            this[pri].postInterceptors = [...postInterceptors];
        } else {
            this[pri].postInterceptors = undefined;
        }
        return this;
    }

    addPostInterceptor(...postInterceptors) {
        if (postInterceptors && postInterceptors.length > 0) {
            this[pri].postInterceptors || (this[pri].postInterceptors = []);
            this[pri].postInterceptors.push(...postInterceptors);
        }
        return this;
    }

    setDictateHandler(dictateHandlers) {
        if (dictateHandlers) {
            this[pri].dictateHandlers = { ...dictateHandlers };
        } else {
            this[pri].dictateHandlers = undefined;
        }
        return this;
    }

    addDictateHandler(dictateHandlers) {
        if (!dictateHandlers) {
            return this;
        }
        if (this[pri].dictateHandlers) {
            this[pri].dictateHandlers = { ...this[pri].dictateHandlers, ...dictateHandlers };
        } else {
            this[pri].dictateHandlers = { ...dictateHandlers };
        }
        return this;
    }

    removeDictateHandler(...names) {
        if (this[pri].dictateHandlers && names && names.length > 0) {
            names.forEach(name => {
                name in this[pri].dictateHandlers && delete this[pri].dictateHandlers[name];
            });
        }
    }

    setSerializater(serializater) {
        this[pri].serializater = serializater;
        return this;
    }

    /**
     * 插件安装
     */
    use(plugin) {
        plugin.install(this);
        return this;
    }
}

const Conf = new Configure();

export default Conf;

export class ConfigureGetter extends Configure {
    get configureGetter() {
        if (!this[pri].configGetter) {
            this[pri].configGetter = {
                get defaultHeaders() {
                    return this[pri].headers || Conf[pri].headers;
                },

                get action() {
                    return (this[pri].action || Conf[pri].action || DefaultAction).toLowerCase();
                },

                get dictates() {
                    return this[pri].dictates || Conf[pri].dictates;
                },

                get baseUrl() {
                    return this[pri].baseUrl || Conf[pri].baseUrl;
                },

                get serializater() {
                    return this[pri].serializater || Conf[pri].serializater || DefaultSerializater;
                },

                get requestHandler() {
                    return this[pri].requestHandler || Conf[pri].requestHandler;
                },

                get preInterceptors() {
                    return this[pri].preInterceptors || Conf[pri].preInterceptors;
                },

                get postInterceptors() {
                    return this[pri].postInterceptors || Conf[pri].postInterceptors;
                },

                getDictateHandler(dictateName) {
                    return (
                        (this[pri].dictateHandlers && this[pri].dictateHandlers[dictateName]) ||
                        (Conf[pri].dictateHandlers && Conf[pri].dictateHandlers[dictateName])
                    );
                }
            };
        }
    }
}
