const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const rollup = require("rollup");
const uglify = require("uglify-js");

function build(builds) {
    let built = 0;
    let total = builds.length;
    let next = () => {
        buildEntry(builds[built])
            .then(() => {
                built++;
                if (built < total) {
                    next();
                }
            })
            .catch(log);
    };
    next();
}

function buildEntry({ input, output }) {
    var isMin = output.min;
    delete output.min;
    return rollup
        .rollup(input)
        .then(bundle => bundle.generate(output))
        .then(({ code }) => {
            if (isMin) {
                var rep = uglify.minify(code, {
                    output: {
                        preamble: output.banner,
                        ascii_only: true
                    }
                });
                if (rep.error) {
                    logError(rep.error);
                    return false;
                } else {
                    return write(output.file, rep.code, true);
                }
            } else {
                return write(output.file, code);
            }
        });
}

function write(dest, code, zip) {
    return new Promise((resolve, reject) => {
        function report(extra) {
            log(
                blue(path.relative(process.cwd(), dest)) +
                    " " +
                    getSize(code) +
                    (extra || "")
            );
            resolve();
        }

        fs.writeFile(dest, code, err => {
            if (err) return reject(err);
            if (zip) {
                zlib.gzip(code, (err, zipped) => {
                    if (err) return reject(err);
                    report(" (gzipped: " + getSize(zipped) + ")");
                });
            } else {
                report();
            }
        });
    });
}

function getSize(code) {
    return (code.length / 1024).toFixed(2) + "kb";
}

function log(e) {
    console.log(e);
}
function logError(e) {
    console.error(e);
}

function blue(str) {
    return "\x1b[1m\x1b[34m" + str + "\x1b[39m\x1b[22m";
}
module.exports = build;
