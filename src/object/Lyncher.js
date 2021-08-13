module.exports = class Lyncher {
	constructor() {
		this.target = -1;
	}

	hang(index) {
		this.target = index;
	}

	async lynch() {}
};
