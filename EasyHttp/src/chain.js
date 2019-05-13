export default class Chain {
    constructor(interceptors, index = 0) {
        this.interceptors = interceptors;
        this.index = index;
    }

    proceed(request) {
        if (this.index >= this.interceptors.length) {
            throw "It's the last interceptor";
        }
        let chain = new Chain(this.interceptors, this.index + 1);
        return this.interceptors[this.index](request, request => chain.proceed(request));
    }
}
