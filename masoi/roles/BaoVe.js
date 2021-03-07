const Role = require("./Role");
const gameConfig = require("../gameConfig");
const {sendMessage} = kb2abot.helpers.fca;

module.exports = class BaoVe extends Role {
	constructor(options) {
		super({
			...{
				type: "BaoVe"
			},
			...options
		});
		this.lastProtectIndex = -1;
	}

	async commitChecker(api, code, value) {
		await super.commitChecker(api, code, value);
		if (code == gameConfig.code.VOTEKILL) return;

		this.testCommit(
			value,
			this.isNumber,
			this.isValidPlayerIndex,
			this.isAlive
		);
		if (this.lastProtectIndex == value - 1) {
			throw new Error("Bạn không được bảo vệ 2 lần cho cùng 1 người chơi!");
		}
		const game = kb2abot.gameManager.find({id: this.gameID});
		const {name, username} = game.playerManager.items[value-1];
		await sendMessage(api, `Bạn đã chọn bảo vệ ${name}(${username})!`, this.threadID);
	}

	async onNightEnd(api, code, value) {
		if (!value) return;
		await super.onNightEnd(api, code, value);
		this.lastProtectIndex = value - 1;
	}

	async onNight(api) {
		const game = kb2abot.gameManager.find({id: this.gameID});
		await sendMessage(
			api,
			"[30s] Đêm nay bạn muốn bảo vệ ai? (chỉ nhập số)\n" + game.chat_playerList({died: false}),
			this.threadID
		);
		return [await this.request(gameConfig.code.BAOVE, gameConfig.timeout.BAOVE)];
	}
};
