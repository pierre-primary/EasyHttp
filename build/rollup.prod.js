const fs = require("fs");
const path = require("path");
const babel = require("rollup-plugin-babel");
const flow = require("rollup-plugin-flow-no-whitespace");
const cjs = require("rollup-plugin-commonjs");
const node = require("rollup-plugin-node-resolve");
const eslint = require("rollup-plugin-eslint");
const replace = require("rollup-plugin-replace");
const build = require("./build");
const version = process.env.VERSION || require("../package.json").version;

const fullPath = p => path.resolve(__dirname, "../", p);

const banner =
    "/*!\n" +
    "* easy-http.js v" +
    version +
    "\n" +
    "* (c) 2018-" +
    new Date().getFullYear() +
    " PengYuan-Jiang\n" +
    "*/";

function genConfig(opts) {
    return {
        input: {
            input: fullPath("src/easy-http.js"),
            plugins: [
                flow(),
                node(),
                eslint({
                    include: [fullPath("src/") + "**/*.js"] // 需要检查的部分
                }),
                cjs(),
                babel({
                    exclude: "node_modules/**"
                })
            ]
        },
        output: {
            file: opts.output,
            format: opts.format,
            name: "EasyHttp",
            banner,
            min: opts.min
        }
    };
}

const builds = [
    {
        output: fullPath("dist/easy-http.js"),
        format: "umd"
    },
    {
        output: fullPath("dist/easy-http.min.js"),
        format: "umd",
        min: true
    },
    {
        output: fullPath("dist/easy-http.common.js"),
        format: "cjs"
    },
    {
        output: fullPath("dist/easy-http.esm.js"),
        format: "es"
    }
].map(genConfig);

var distDir = fullPath("dist/");
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}
build(builds);
