const Role = require("./Role");
const gameConfig = require("../gameConfig");

module.exports = class SoiThuong extends Role {
	constructor(options) {
		super({
			...{
				type: "SoiThuong"
			},
			...options
		});
	}

	async commitChecker(api, code, value) {
		await super.commitChecker(api, code, value);
		if (code == gameConfig.code.VOTEKILL) return;

		this.testCommit(
			value,
			this.isNumber,
			this.isValidPlayerIndex,
			this.isAlive,
			this.isNotSelf
		);
		const game = kb2abot.gameManager.find({id: this.gameID});
		const {name, username} = game.playerManager.items[value-1];
		await this.sendMessage(api, `Bạn đã chọn cắn ${name}(${username})!`);
	}

	async onNight(api) {
		const game = kb2abot.gameManager.find({id: this.gameID});
		await game.u_timingSend({
			api,
			message: "Bạn muốn cắn ai trong đêm nay 💀 (chỉ nhập số)\n" +
								game.chat_playerList({died: false}),
			timing: gameConfig.timeout.SOITHUONG,
			threadID: this.threadID
		});
		return [await this.request(gameConfig.code.SOITHUONG, gameConfig.timeout.SOITHUONG)];
	}
};
