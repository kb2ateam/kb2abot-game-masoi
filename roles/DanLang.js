const Role = require("./Role");

module.exports = class DanLang extends Role {
	constructor(options) {
		super({
			...{
				type: "DanLang"
			},
			...options
		});
	}
};
