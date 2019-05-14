import { is } from "./utils/utils";
import { initDictate } from "./odl/odl-utils";

const DefaultMethod = "get";
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
        this.setDefaultMethod(options.defaultMethod);
        this.setDictate(options.dictate);
        this.setHeaders(options.headers);
        this.setRequestHandler(options.requestHandler);
        this.setInterceptor(options.interceptors);
        this.setSerializater(options.serializater);
    }

    setBaseUrl(baseUrl) {
        this[pri].baseUrl = baseUrl || undefined;
        return this;
    }

    setDefaultMethod(defaultMethod) {
        this[pri].defaultMethod = defaultMethod;
        return this;
    }

    setDictate(dictateStr) {
        this[pri].dictates = initDictate(dictateStr);
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

    setInterceptor(...interceptors) {
        if (interceptors && interceptors.length > 0) {
            this[pri].interceptors = [...interceptors];
        } else {
            this[pri].interceptors = null;
        }
    }

    addInterceptor(...interceptors) {
        if (interceptors && interceptors.length > 0) {
            this[pri].interceptors || (this[pri].interceptors = []);
            this[pri].interceptors.push(...interceptors);
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
}

const Conf = new Configure();

export default Conf;

export class ConfigureGetter extends Configure {
    get getter() {
        if (this[pri].getter) {
            return this[pri].getter;
        }
        let that = this;
        this[pri].getter = {
            get headers() {
                return that[pri].headers || Conf[pri].headers;
            },

            get defaultMethod() {
                return (that[pri].defaultMethod || Conf[pri].defaultMethod || DefaultMethod).toLowerCase();
            },

            get dictates() {
                return that[pri].dictates || Conf[pri].dictates;
            },

            get baseUrl() {
                return that[pri].baseUrl || Conf[pri].baseUrl;
            },

            get serializater() {
                return that[pri].serializater || Conf[pri].serializater || DefaultSerializater;
            },

            get requestHandler() {
                return that[pri].requestHandler || Conf[pri].requestHandler;
            },

            get interceptors() {
                return that[pri].interceptors || Conf[pri].interceptors;
            },

            getDictateHandler(dictateName) {
                return (
                    (that[pri].dictateHandlers && that[pri].dictateHandlers[dictateName]) ||
                    (Conf[pri].dictateHandlers && Conf[pri].dictateHandlers[dictateName])
                );
            }
        };
        return this[pri].getter;
    }
}
