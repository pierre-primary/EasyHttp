const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const rollup = require("rollup");
const terser = require("terser");

function build(input, ...outputs) {
    let p = rollup.rollup(input);
    outputs.forEach(output => {
        p.then(bundle => {
            return bundle.generate(output);
        }).then(({ output: [{ code, map }] }) => {
            let targetPath = output.file;
            let p1 = write(targetPath, code, true);

            if (map) {
                p1 = p1.then(() => {
                    let targetMapPath = targetPath + ".map";
                    return write(targetMapPath, JSON.stringify(map));
                });
            }

            if (output.minFile) {
                p1 = p1.then(() => {
                    let banner = output.banner ? output.banner + "\n" : "";
                    let footer = output.footer ? "\n" + output.footer : "";
                    let targetMinPath = output.minFile;
                    let minified = banner + minify(code).code + footer;
                    return write(targetMinPath, minified, true);
                });
            }
        });
    });
}

function minify(code) {
    let minified = terser.minify(code, {
        toplevel: true,
        sourceMap: true,
        output: {
            ascii_only: true
        },
        compress: {
            pure_funcs: ["makeMap"]
        }
    });
    return minified;
}

function write(filePath, str, showSize) {
    return new Promise((resolve, reject) => {
        if (!mkdirsSync(path.dirname(filePath))) {
            reject("目录：" + filePath + " 创建失败");
        }
        fs.writeFile(filePath, str, err => {
            if (err) {
                reject(err);
            }
            if (showSize) {
                zlib.gzip(str, (err, zipped) => {
                    if (err) {
                        reject(err);
                    }
                    console.log(path.relative(process.cwd(), filePath) + " " + getSize(str) + " (gzipped: " + getSize(zipped) + ")");
                    resolve();
                });
            } else {
                console.log(path.relative(process.cwd(), filePath));
                resolve();
            }
        });
    });
}
function mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
        return true;
    } else {
        if (mkdirsSync(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
            return true;
        }
    }
}
function getSize(str) {
    return (str.length / 1024).toFixed(2) + "kb";
}

module.exports = build;
