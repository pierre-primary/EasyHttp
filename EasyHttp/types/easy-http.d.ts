/// <reference no-default-lib="true"/>

declare type Request = {
    url: string;
    params: object;
    action: string;
    data: object;
    other: object;
    header: object;
};
declare type RequestHandler = {
    setHeader(value: { [x: string]: string }): RequestHandler;
    addHeader(value: { [x: string]: string }): RequestHandler;
    getHeader(): object;
    getUrl(): string;
};

declare class EasyHttpConstructor {
    constructor(
        baseUrl?: string,
        requests?: {
            [x: string]:
                | string
                | {
                      a?: string;
                      action?: string;
                      urlFormat?: string;
                      u?: string;
                      dictate?: string;
                      d?: string;
                      hold?: boolean;
                      h?: boolean;
                  };
        }
    );

    static setBaseUrl(baseUrl: string): typeof EasyHttpConstructor;
    static setHeader(headers: { [x: string]: string }): typeof EasyHttpConstructor;
    static addHeader(headers: { [x: string]: string }): typeof EasyHttpConstructor;
    static bindHandler(handler: (request: Request) => Promise<T>): typeof EasyHttpConstructor;
    static bindPreHandler(
        handler: (request: Request, resolve: (value?: any) => void, reject: (reason?: any) => void) => boolean
    ): typeof EasyHttpConstructor;
    static bindPostHandler(handler: (value: Promise<T>) => Promise<T>): typeof EasyHttpConstructor;
    static bindDictate(dictate: string, handler: (value: string) => string): typeof EasyHttpConstructor;
    static setAction(actionName: string): typeof EasyHttpConstructor;
    static setDictate(dictate: string): typeof EasyHttpConstructor;
    static setSerializater(serializater: (obj: any) => string): typeof EasyHttpConstructor;
    static setEscape(esc: boolean): typeof EasyHttpConstructor;
    static use(plugin: { install(host: typeof EasyHttpConstructor) }): typeof EasyHttpConstructor;

    setBaseUrl(baseUrl: string): EasyHttp;
    setHeader(headers: { [x: string]: string }): EasyHttp;
    addHeader(headers: { [x: string]: string }): EasyHttp;
    bindHandler(handler: (request: Request) => Promise<T>): EasyHttp;
    bindPreHandler(handler: (request: Request, resolve: (value?: any) => void, reject: (reason?: any) => void) => boolean): EasyHttp;
    bindPostHandler(handler: (value: Promise<T>) => Promise<T>): EasyHttp;
    bindDictate(dictate: string, handler: (value: string) => string): EasyHttp;
    setAction(actionName: string): EasyHttp;
    setDictate(dictate: string): EasyHttp;
    setSerializater(serializater: (obj: any) => string): EasyHttp;
    setEscape(esc: boolean): EasyHttp;
    use(plugin: { install(host: EasyHttpConstructor) }): EasyHttp;

    addRequests(requests: {
        [x: string]:
            | string
            | {
                  a?: string;
                  action?: string;
                  urlFormat?: string;
                  u?: string;
                  dictate?: string;
                  d?: string;
                  hold?: boolean;
                  h?: boolean;
              };
    }): EasyHttp;
    [x: string]: ((params?: { [x: string]: any }, data?: any) => Promise<T>) | RequestHandler;
}

declare module "@y-bao/easy-http" {
    export default EasyHttpConstructor;
}
