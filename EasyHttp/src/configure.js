import { is } from "./utils/utils";

export default class Configure {
    setBaseUrl(baseUrl) {
        this.baseUrl = baseUrl || "";
        return this;
    }
    /**
     *全局绑定事件 GET,POST 等
     */
    bindAction(aName, a) {
        if (aName && a) {
            this.am || (this.am = {});
            this.am[aName.toLowerCase()] = a;
        }
        return this;
    }

    /**
     *全局绑定自定义命令
     */
    bindDictate(dName, d) {
        if (dName && d) {
            this.dm || (this.dm = {});
            this.dm[dName.toLowerCase()] = d;
        }
        return this;
    }

    /**
     *绑定序列化处理器
     */
    setSerializater(sz) {
        this.sz = sz;
        return this;
    }

    /**
     *绑定全局错误处理器
     */
    setErrorHandler(eh) {
        this.eh = eh;
        return this;
    }

    setEscape(esc) {
        this.esc = esc;
        return this;
    }
    /**
     *添加参数预处理器
     */
    addProcessor(...pcs) {
        if (pcs) {
            this.pcs || (this.pcs = new Array());
            this.pcs.push(...pcs);
        }
        return this;
    }
    /**
     * 插件安装
     */
    use(plugin) {
        if (plugin && plugin.install && is(plugin.install, Function)) {
            plugin.install(this);
        }
        return this;
    }
}

export const Conf = new Configure();

export class UseConfigureImpt {
    constructor(outConfigure) {
        this.outConf = outConfigure;
    }

    set escape(value) {
        value && (this.esc = value);
    }

    get escape() {
        if (this.esc != undefined) {
            return this.esc;
        }
        if (this.outConf.esc != undefined) {
            return this.outConf.esc;
        }
        if (Conf.esc != undefined) {
            return Conf.esc;
        }
        return false;
    }

    get baseUrl() {
        return this.outConf.baseUrl || Conf.baseUrl;
    }

    get serializater() {
        return this.outConf.sz || Conf.sz;
    }

    get errorHandler() {
        return this.outConf.eh || Conf.eh;
    }

    get processors() {
        return this.outConf.pcs || Conf.pcs;
    }

    actionMap(aName) {
        return (this.outConf.am && this.outConf.am[aName]) || (Conf.am && Conf.am[aName]);
    }

    dictateMap(dName) {
        return (this.outConf.dm && this.outConf.dm[dName]) || (Conf.dm && Conf.dm[dName]);
    }
}
