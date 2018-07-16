import axios from "axios";

const Handlers = {
    get(o, c, er) {
        axios
            .get(o.url)
            .then(function (res) {
                c(res.statusCode, res.data, res.header, res.errMsg);
            })
            .catch(function () {
                er(0, null, null, "");
            });
    },

    post(o, c, er) {
        axios
            .post(o.url)
            .then(function (res) {
                c(res.statusCode, res.data, res.header, res.errMsg);
            })
            .catch(function () {
                er(0, null, null, "");
            });
    }
};

export default {
    install(host) {
        host.bindHandler((o, c, er) => {
            let act = (o.action || "").toLowerCase();
            if (Handlers[act]) {
                Handlers[act](o, c, er);
            } else {
                console.warn(`EasyHttpAxios:not found action '${act}'`, "\n");
            }
        });
    }
};
