const Role = require('./Role');
const gameConfig = require('../gameConfig');

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
		this.sendMessage(
			`Bạn đã chọn xem role của người chơi ${name}(${username})!`
		);
	}

	async onNightEnd(code, value) {
		if (!value) return;
		await super.onNightEnd(code, value);

		const {name, username, type} = this.game.playerManager.items[value - 1];
		const party = gameConfig.data[type].party > 0 ? 'Dân Làng' : 'Sói';
		await this.sendMessage(`Phe của ${name}(${username}) là /${party}/`);
	}

	async onNight() {
		await this.timingSend({
			message:
				'Đêm nay bạn muốn soi ai? (cấm soi gái và chỉ nhập số)\n' +
				this.game.chat_playerList(),
			timing: gameConfig.timeout.TIENTRI
		});
		return [
			await this.request(gameConfig.code.TIENTRI, gameConfig.timeout.TIENTRI)
		];
	}
};
