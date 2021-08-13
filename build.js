const fs = require('fs');
const Buffer = require('safer-buffer').Buffer;
const AdmZip = require('adm-zip');
const {version} = require('./package.json');
const zip = new AdmZip();
zip.addLocalFile('./src/index.js', 'masoi');
const prefix = `const version = '${version}';\n`;
const exCfg = `${prefix}${fs
	.readFileSync(__dirname + '/src/gameConfig.example.js')
	.toString()}`;
zip.addFile(
	'masoi/gameConfig.example.js',
	Buffer.alloc(Buffer.byteLength(exCfg), exCfg)
);
zip.addLocalFolder('./src/role', 'masoi/role');
// or write everything to disk
zip.writeZip(`./build/masoi${version}.zip`);
