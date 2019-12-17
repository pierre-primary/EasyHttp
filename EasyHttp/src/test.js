

function makeRequestFunc(target, rule) {
    return options => {
        options || (options = {});
        if (typeof rule == "string") {
            rule = { url: rule };
        }
        return target.request({
            method: rule.method || "",
            ...options,
            url: rule.url || ""
        });
    };
}

if (Utils.isCanUseProxy()) {
    EasyHttp.prototype.rules = function(rules) {
        this.$rules = rules;
        return this;
    };
    const originalCreate = MainEasyHttp.prototype.create;
    MainEasyHttp.prototype.create = function(config) {
        return new Proxy(originalCreate(config), {
            get(target, key) {
                if (key in target) {
                    return target[key];
                }
                if (target.$rules && key in target.$rules) {
                    return makeRequestFunc(target, target.$rules[key]);
                }
            }
        });
    };
} else {
    EasyHttp.prototype.rules = function(rules) {
        this.$rules = rules;
        for (let key in rules) {
            if (this[key]) {
                continue;
            }
            this[key] = makeRequestFunc(this, rules[key]);
        }
        return this;
    };
}
