const {Party} = require('../enum');
const Format = require('../format');
const Ability = require('./Ability');

module.exports = class Seer extends Ability {
	static question(player) {
		return (
			'Bạn muốn soi ai trong danh sách:\n' + player.world.game.listPlayer()
		);
	}

	static check(player, value) {
		const index = player.format(value, Format.validIndex, Format.notSelf);
		player.sendMessage(
			`Bạn đã chọn xem phe của người chơi ${player.world.items[index].name}!`
		);
		return index;
	}

	static async nightend(player, index, listDeaths) {
		if (index == null) return;
		const target = player.world.items[index];
		for (let partyName in Party) {
			if (Party[partyName] != target.party) continue;
			await player.sendMessage(`Phe của ${target.name} là /${partyName}/`);
			break;
		}
	}
};
