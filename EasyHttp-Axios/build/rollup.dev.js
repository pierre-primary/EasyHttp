import path from "path";
import resolve from "rollup-plugin-node-resolve";
import eslint from "rollup-plugin-eslint";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import replace from "rollup-plugin-replace";

const fullPath = p => path.resolve(__dirname, "../", p);

module.exports = {
    input: fullPath("src/easy-http-axios.js"),
    output: {
        file: fullPath("test/dev.js"),
        format: "umd",
        name: "EasyBar",
        sourcemap: true
    },
    plugins: [
        replace({
            ENV: JSON.stringify(process.env.NODE_ENV || "development")
        }),
        resolve({
            jsnext: true,
            main: true,
            browser: true
        }),
        eslint({
            include: [fullPath("src/") + "**/*.js"] // 需要检查的部分
        }),
        commonjs(),
        babel({
            exclude: "node_modules/**"
        })
    ]
};
