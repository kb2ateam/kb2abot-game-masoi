const AdmZip = require("adm-zip");
const {version} = require("./package.json");
const zip = new AdmZip();
zip.addLocalFile("./index.js", "masoi");
zip.addLocalFile("./gameConfig.js", "masoi");
zip.addLocalFolder("./roles", "masoi/roles");
// or write everything to disk
zip.writeZip(`./builds/masoi ${version}.zip`);
