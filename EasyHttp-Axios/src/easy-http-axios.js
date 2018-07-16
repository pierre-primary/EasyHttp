import axios from "axios";

const Handlers = {
    get(o) {
        return axios
            .get(o.url);
    },

    post(o) {
        return axios
            .post(o.url, o.data);
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
