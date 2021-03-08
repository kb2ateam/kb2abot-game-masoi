const Role = require("./Role");
const gameConfig = require("../gameConfig");

module.exports = class TienTri extends Role {
	constructor(options) {
		super({
			...{
				type: "TienTri"
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
			this.isNotSelf
		);
		const game = kb2abot.gameManager.find({id: this.gameID});
		const {name, username} = game.playerManager.items[value-1];
		await this.sendMessage(api, `Bạn đã chọn xem role của người chơi ${name}(${username})!`);
	}

	async onNightEnd(api, code, value) {
		if (!value) return;
		await super.onNightEnd(api, code, value);
		const game = kb2abot.gameManager.find({id: this.gameID});
		const {name, username, type} = game.playerManager.items[value-1];
		const party = gameConfig.data[type].party > 0 ? "Dân Làng" : "Sói";
		await this.sendMessage(api, `Phe của ${name}(${username}) là /${party}/`);
	}

	async onNight(api) {
		const game = kb2abot.gameManager.find({id: this.gameID});
		await game.u_timingSend({
			api,
			message: "Đêm nay bạn muốn soi ai? (cấm soi gái và chỉ nhập số)\n" +
			game.chat_playerList(),
			timing: gameConfig.timeout.TIENTRI,
			threadID: this.threadID
		});
		return [await this.request(gameConfig.code.TIENTRI, gameConfig.timeout.TIENTRI)];
	}
};
