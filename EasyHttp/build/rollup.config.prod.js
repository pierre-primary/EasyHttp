const { eslint } = require("rollup-plugin-eslint");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");
const babel = require("rollup-plugin-babel");
const build = require("./build.js");
const version = process.env.VERSION || require("../package.json").version;

const banner = "/*\n" + "* easy-http v" + version + "\n" + "* (c) 2018-" + new Date().getFullYear() + " PengYuan-Jiang\n*/";

const inputOptions = {
    input: "src/easy-http.js",
    cache: true,
    plugins: [
        commonjs(),
        resolve(),
        // eslint({
        //     include: ["src/**/*.js"] // 需要检查的部分
        // }),
        babel({
            plugins: ["@babel/plugin-transform-runtime"],
            presets: [
                [
                    "@babel/preset-env",
                    {
                        targets: {
                            browsers: ["> 5%", "last 2 versions", "ie >= 8"],
                            node: "current"
                        },
                        modules: false
                    }
                ]
            ],
            exclude: "node_modules/**",
            runtimeHelpers: true
        })
    ]
};
const outputOptions = [
    {
        file: "./dist/easy-http.js",
        minFile: "./dist/easy-http.min.js",
        name: "EasyHttp",
        format: "umd",
        banner: banner
    },
    {
        file: "./dist/easy-http.common.js",
        format: "cjs",
        banner: banner
    },
    {
        file: "./dist/easy-http.esm.js",
        format: "es",
        banner: banner
    }
];

build(inputOptions, ...outputOptions);
