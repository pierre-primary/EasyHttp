function chain(request, interceptors, index = 0) {
    if (index >= interceptors.length) {
        throw "It's the last interceptor";
    }
    return interceptors[index](request, request =>
        chain(request, interceptors, index + 1)
    );
}

class IEasyHttp {
    constructor(config) {
        config || (config = {});
        this.config = {
            baseUrl: config.baseUrl,
            headers: {},
            timeout: 0
        };
    }
    _init(config) {
        config || (config = {});
        this.config = {
            baseUrl: config.baseUrl,
            headers: {},
            timeout: 0
        };
    }
    request(options) {
        let interceptors = [
            ...(this.interceptors || []),
            request => {
                console.log(request);
                // return requestHandler(request);
            }
        ];
        return chain(options, interceptors);
    }
}

class EasyHttp extends IEasyHttp {}

class MainEasyHttp extends IEasyHttp {
    init(config) {
        this._init(config);
    }
    create(config) {
        return new EasyHttp(config);
    }
}

const eh = new MainEasyHttp();

module.exports = eh;
module.exports.default = eh;
