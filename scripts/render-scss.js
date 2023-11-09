"use strict"

const autoprefixer = require("autoprefixer")
const fs = require("fs")
const upath = require("upath")
const postcss = require("postcss")
const sass = require("sass")
const sh = require("shelljs")

const inputPath = upath.resolve(upath.dirname(__filename), "../src/scss/styles.scss")
const outputPath = upath.resolve(upath.dirname(__filename), "../dist/css/style.min.css")

/**
 * @returns {string}
 */
function build() {
    const result = sass.compile(inputPath, {
        loadPaths: [upath.resolve(upath.dirname(__filename), "../node_modules")],
        style: "compressed",
    })

    if (result.css.charCodeAt(0) === 0xfeff) {
        return result.css.slice(1)
    }

    return result.css
}

function createDir() {
    const baseDir = upath.dirname(outputPath)

    if (!sh.test("-e", baseDir)) {
        sh.mkdir("-p", baseDir)
    }
}

module.exports = function renderSCSS() {
    const css = build()

    createDir()

    console.log(`CSS file saved at '${outputPath}'`)
    fs.writeFileSync(outputPath, `@charset "UTF-8";\n` + css, {
        encoding: "utf8",
    })

    postcss([autoprefixer])
        .process(css, { from: undefined })
        .then((result) => {
            result.warnings().forEach((warn) => {
                console.warn(warn.toString())
            })
        })
}
