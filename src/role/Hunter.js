const Ability = require('../ability');
const Format = require('../format');
const {Death} = require('../type');
const {DeathType} = require('../enum');
const Villager = require('./Villager');

module.exports = class Hunter extends Villager {
	constructor(options) {
		super({
			...options,
			...{}
		});
	}

	async die(death) {
		await super.die(death);
		if (death.type == DeathType.LYNCH)
			await this.sendMessage('Bạn đang bị cả làng treo cổ!');
		else await this.sendMessage('Bạn đã bị giết!');

		const movement = await this.request(Ability.Kill);
		const index = Format.validIndex(this, movement.value);
		const victim = this.world.items[index];
		await victim.sendMessage('Bạn đã bị [Hunter] bắn chết!');
		await this.world.game.sendMessage(
			'Có một tiếng súng vang lên khắp cả làng!'
		);
		await victim.die(new Death(this, victim, DeathType.P2P));
	}
};
