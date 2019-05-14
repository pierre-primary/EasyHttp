const { eslint } = require("rollup-plugin-eslint");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");
const babel = require("rollup-plugin-babel");
const build = require("./build.js");

const inputOptions = {
    input: "test/dev.js",
    cache: true,
    plugins: [
        commonjs(),
        resolve(),
        babel({
            plugins: ["@babel/plugin-transform-runtime"],
            presets: [
                [
                    "@babel/preset-env",
                    {
                        targets: {
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
const outputOptions = {
    file: "./test/index.js",
    format: "cjs",
    sourcemap: true
};

build(inputOptions, outputOptions);
