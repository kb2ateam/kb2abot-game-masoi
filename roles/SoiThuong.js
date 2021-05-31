const Role = require('./Role');
const gameConfig = require('../gameConfig');

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
		this.sendMessage(`Bạn đã chọn cắn ${name}(${username})!`);
	}

	async onNight() {
		await this.timingSend({
			message:
				'Bạn muốn cắn ai trong đêm nay 💀 (chỉ nhập số)\n' +
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
