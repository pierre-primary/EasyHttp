const fs = require("fs");
const path = require("path");
const babel = require("rollup-plugin-babel");
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
                eslint({
                    include: [fullPath("src/") + "**/*.js"] // 需要检查的部分
                }),
                babel({
                    exclude: "node_modules/**",
                    runtimeHelpers: true
                })
            ],
            external: [
                "babel-runtime/core-js/object/get-own-property-descriptor",
                "babel-runtime/core-js/promise",
                "babel-runtime/core-js/object/define-property",
                "babel-runtime/helpers/classCallCheck",
                "babel-runtime/helpers/createClass",
                "babel-runtime/core-js/json/stringify",
                "babel-runtime/core-js/symbol",
                "babel-runtime/helpers/toConsumableArray",
                "babel-runtime/core-js/object/get-prototype-of",
                "babel-runtime/helpers/possibleConstructorReturn",
                "babel-runtime/helpers/inherits"
            ]
        },
        output: {
            file: opts.output,
            format: opts.format,
            name: "EasyHttp",
            exports: "default",
            banner,
            min: opts.min,
            globals: {
                "babel-runtime/core-js/object/get-own-property-descriptor": "_Object$getOwnPropertyDescriptor",
                "babel-runtime/core-js/promise": "_Promise",
                "babel-runtime/core-js/object/define-property": "_Object$defineProperty",
                "babel-runtime/helpers/classCallCheck": "_classCallCheck",
                "babel-runtime/helpers/createClass": "_toConsumableArray",
                "babel-runtime/core-js/json/stringify": "_toConsumableArray",
                "babel-runtime/core-js/symbol": "_toConsumableArray",
                "babel-runtime/helpers/toConsumableArray": "_toConsumableArray",
                "babel-runtime/core-js/object/get-prototype-of": "_Object$getPrototypeOf",
                "babel-runtime/helpers/possibleConstructorReturn": "_possibleConstructorReturn",
                "babel-runtime/helpers/inherits": "_inherits"
            }
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
