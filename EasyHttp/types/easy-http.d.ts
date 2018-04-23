export type Serializater = (obj: any) => string;
export type Action = (url: string, data: any) => void;
export type DictateHandler = (value: string) => string;
export type ErrorHandler = (obj: any) => void;
export type Processor = (value: string) => string;

export type EasyHttpStatic = typeof EasyHttp;

declare class EasyHttp {
    [x: string]: ((params?: { [x: string]: any }, data?: any) => Promise<T>);

    constructor(
        baseUrl: string,
        options: {
            [x: string]: {
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

    bindAction(actionName: string, action: Action): EasyHttp;
    bindDictate(dictate: string, handler: DictateHandler): EasyHttp;
    setSerializater(serializater: Serializater): EasyHttp;
    setIsHold(isHold?: boolean): EasyHttp;
    setErrorHandler(errorHandler: ErrorHandler): EasyHttp;
    addProcessor(processors: Processor): EasyHttp;
    use(plugin: Plugin): EasyHttp;
    static bindAction(actionName: string, action: Action): EasyHttpStatic;
    static bindDictate(dictate: string, handler: DictateHandler): EasyHttpStatic;
    static setSerializater(serializater?: Serializater): EasyHttpStatic;
    static setErrorHandler(errorHandler?: ErrorHandler): EasyHttpStatic;
    static setIsHold(isHold?: boolean): EasyHttpStatic;
    static addProcessor(processors: Processor): EasyHttpStatic;
    static use(plugin: Plugin): EasyHttpStatic;
}

export default EasyHttp;

export interface Plugin {
    install(host: EasyHttp | EasyHttpStatic);
}

declare const EasyHttp: EasyHttp;
