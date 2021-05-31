const fs = require('fs');
const Buffer = require('safer-buffer').Buffer;
const AdmZip = require('adm-zip');
const {version} = require('./package.json');
const zip = new AdmZip();
zip.addLocalFile('./index.js', 'masoi');
const prefix = `const version = '${version}';\n`;
const exCfg = `${prefix}${fs
	.readFileSync(__dirname + '/gameConfig.example.js')
	.toString()}`;
zip.addFile(
	'masoi/gameConfig.example.js',
	Buffer.alloc(Buffer.byteLength(exCfg), exCfg)
);
zip.addLocalFolder('./roles', 'masoi/roles');
// or write everything to disk
zip.writeZip(`./builds/masoi${version}.zip`);
