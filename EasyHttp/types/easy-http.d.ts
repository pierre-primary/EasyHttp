type Serializater = ((obj: any) => string);
type Action = ((url: string, data: any) => void);
type DictateHandler = ((value: string) => string);
type ErrorHandler = ((obj: any) => void);
type Processor = ((value: string) => string);

type Request =((params:{[x: string]: any},data?: any) => Promise);

export declare class EasyHttp {
    constructor(baseUrl: string, options:{[x:string]: {
        a:string,
        action:string,
        urlFormat:string,
        u:string,
        dictate:string,
        d:string
    }});
    bindAction(actionName: string, action: Action):EasyHttp;
    bindDictate(dictate: string, handler: DictateHandler):EasyHttp;
    setSerializater(serializater: Serializater):EasyHttp;
    setIsHold(isHold?: boolean):EasyHttp;
    setErrorHandler(errorHandler: ErrorHandler):EasyHttp;
    addProcessor(...processors: ...Processor):EasyHttp;
    use(plugin: Plugin):EasyHttp;
    static bindAction(actionName: string, action: Action):typeof EasyHttp;
    static bindDictate(dictate: string, handler: DictateHandler):typeof EasyHttp;
    static setSerializater(serializater?: Serializater):typeof EasyHttp;
    static setErrorHandler(errorHandler?: ErrorHandler):typeof EasyHttp;
    static setIsHold(isHold?: boolean):typeof EasyHttp;
    static addProcessor(...processors: ...Processor):typeof EasyHttp;
    static use(plugin: Plugin):typeof EasyHttp;
    [x:string]:((params?:{[x: string]: any},data?: any) => Promise);
}

export declare interface Plugin {
    install(host:(EasyHttp | typeof EasyHttp));
}

