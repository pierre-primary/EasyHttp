import axios from "axios";
axios.defaults.withCredentials = true;
const Handlers = {
    get(o) {
        return axios
            .get(o.url, null, {
                headers: o.header
            });
    },

    post(o) {
        axios.defaults.headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
        return axios
            .post(o.url, o.data, {
                headers: o.header
            });
    }
};

export default {
    install(host) {
        host.bindHandler(o => {
            let act = (o.action || "").toLowerCase();
            if (Handlers[act]) {
                return Handlers[act](o);
            }
            throw `EasyHttpAxios:not found action '${act}'`;
        });
    }
};
