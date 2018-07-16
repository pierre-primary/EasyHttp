import axios from "axios";

const Handlers = {
    get(o) {
        return axios
            .get(o.url);
    },

    post(o) {
        return axios
            .post(o.url);
    }
};

export default {
    install(host) {
        host.bindHandler((o, c, er) => {
            let act = (o.action || "").toLowerCase();
            if (Handlers[act]) {
                return Handlers[act](o, c, er);
            }
            throw `EasyHttpAxios:not found action '${act}'`;
        });
    }
};
