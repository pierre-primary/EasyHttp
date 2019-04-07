const { eslint } = require("rollup-plugin-eslint");
const babel = require("rollup-plugin-babel");
const build = require("./build.js");
const version = process.env.VERSION || require("../package.json").version;

const banner = "/*\n" + "* easy-http v" + version + "\n" + "* (c) 2018-" + new Date().getFullYear() + " PengYuan-Jiang\n*/";

const inputOptions = {
    input: "src/easy-http.js",
    cache: true,
    plugins: [
        // eslint({
        //     include: ["src/**/*.js"] // 需要检查的部分
        // }),
        babel({
            presets: [
                [
                    "@babel/env",
                    {
                        targets: {
                            node: "current"
                        },
                        modules: false
                    }
                ]
            ],
            exclude: "node_modules/**"
        })
    ]
};
const outputOptions = {
    file: "./dist/easy-http.miniapp.js",
    minFile: "./dist/easy-http.miniapp.min.js",
    format: "cjs",
    banner: banner
};

build(inputOptions, outputOptions);
