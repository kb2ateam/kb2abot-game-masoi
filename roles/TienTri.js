const Role = require('./Role');
const gameConfig = require('../gameConfig');
const {asyncWait, random, shuffle} = kb2abot.helpers;

module.exports = class TienTri extends Role {
	constructor(options) {
		super({
			...{
				type: 'TienTri'
			},
			...options
		});
	}

	commitChecker(code, value) {
		if (code == gameConfig.code.VOTEKILL)
			return super.commitChecker(code, value);

		this.testCommit(value, this.isNotSelf);
		const {name, username} = this.game.playerManager.items[value - 1];
		// this.sendMessage(
		// 	`🔮 Đã chọn xem role của người chơi ${name}!`
		// );
	}

	async onNightEnd(code, value) {
		if (!value) return;
		await super.onNightEnd(code, value);

		const {name, username, type} = this.game.playerManager.items[value - 1];
		const party = gameConfig.data[type].party > 0 ? 'Dân Làng' : 'Sói';
		await asyncWait(1000);
		await this.sendMessage(`🔮 Phe của ${name} là ${party}`);
	}

	async onNight() {
		await asyncWait(1000);
		await this.timingSend({
			message:
				'🔮 Đêm nay soi ai? \n' +
				this.game.chat_playerList(),
			timing: gameConfig.timeout.TIENTRI
		});
		return [
			await this.request(gameConfig.code.TIENTRI, gameConfig.timeout.TIENTRI)
		];
	}
};
