import axios from "axios";

const Handlers = {
    get(o) {
        axios
            .get(o.url)
            .then(function(response) {
                o.resolve(response);
            })
            .catch(function(error) {
                o.reject(error);
            });
    },

    post(o) {
        axios
            .post(o.url)
            .then(function(response) {
                o.resolve(response);
            })
            .catch(function(error) {
                o.reject(error);
            });
    }
};

export default {
    install(host) {
        host.setHandler(o => {
            let act = (o.action || "").toLowerCase();
            if (Handlers[act]) {
                Handlers[act](o);
            } else {
                console.warn(`EasyHttpAxios:not found action '${act}'`, "\n");
            }
        });
    }
};
