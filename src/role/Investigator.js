const Ability = require('../ability');
const Villager = require('./Villager');

module.exports = class Investigator extends Villager {
	constructor(options) {
		super({
			...options,
			...{}
		});
	}

	async onNight() {
		return [await this.request(Ability.Investigator)];
	}
};
