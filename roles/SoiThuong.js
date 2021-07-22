const Role = require('./Role');
const gameConfig = require('../gameConfig');
const {asyncWait, random, shuffle} = kb2abot.helpers;

module.exports = class SoiThuong extends Role {
	constructor(options) {
		super({
			...{
				type: 'SoiThuong'
			},
			...options
		});
	}

	commitChecker(code, value) {
		if (code == gameConfig.code.VOTEKILL)
			return super.commitChecker(code, value);

		this.testCommit(value, this.isAlive, this.isNotSelf);
		const {name, username} = this.game.playerManager.items[value - 1];
		// this.sendMessage(`💀 Đã chọn cắn ${name}!`);
	}

	async onNight() {
		await asyncWait(1000);
		await this.timingSend({
			message:
				'🐺 Đêm nay cắn ai ? 💀💀\n' +
				this.game.chat_playerList({died: false}),
			timing: gameConfig.timeout.SOITHUONG
		});
		return [
			await this.request(
				gameConfig.code.SOITHUONG,
				gameConfig.timeout.SOITHUONG
			)
		];
	}
};
