const Ability = require('../ability');
const Villager = require('./Villager');

module.exports = class Goodseer extends Villager {
	constructor(options) {
		super({
			...options,
			...{
				// your configuration
			}
		});
	}

	async onNight() {
		return [await this.request(Ability.Seer)];
	}
};
