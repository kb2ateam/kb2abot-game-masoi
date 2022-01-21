const fs = require("fs")
const Buffer = require("safer-buffer").Buffer
const AdmZip = require("adm-zip")
const {version} = require("./package.json")
const zip = new AdmZip()
zip.addLocalFile("./src/index.js", "masoi")
const prefix = `module.exports.version = '${version}';\n`
const exCfg = `${prefix}${fs
	.readFileSync(__dirname + "/src/gameConfig.example.js")
	.toString()}`
zip.addLocalFolder("./src/", "masoi")
zip.addFile(
	"masoi/gameConfig.example.js",
	Buffer.alloc(Buffer.byteLength(exCfg), exCfg)
)
// or write everything to disk
zip.writeZip(`./build/masoi${version}.zip`)
