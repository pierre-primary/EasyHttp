import axios from "axios";

function get(resolve, reject, url) {
    axios
        .get(url)
        .then(function(response) {
            resolve(response);
        })
        .catch(function(error) {
            reject(error);
        });
}

function post(resolve, reject, url) {
    axios
        .post(url)
        .then(function(response) {
            resolve(response);
        })
        .catch(function(error) {
            reject(error);
        });
}

export default {
    install(host) {
        host.bindAction("get", get);
        host.bindAction("post", post);
    }
};
