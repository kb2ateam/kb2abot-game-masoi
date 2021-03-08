const Role = require("./Role");
const gameConfig = require("../gameConfig");
const {asyncWait} = kb2abot.helpers;

module.exports = class ThoSan extends Role {
	constructor(options) {
		super({
			...{
				type: "ThoSan"
			},
			...options
		});
		this.pinnedIndex = -1;
	}

	async commitChecker(api, code, value) {
		await super.commitChecker(api, code, value);
		if (code == gameConfig.code.VOTEKILL) return;

		this.testCommit(value, this.isAlive);
		const game = kb2abot.gameManager.find({id: this.gameID});
		const {name, username} = game.playerManager.items[value-1];
		switch(code) {
		case gameConfig.code.THOSAN_NIGHT:
			await this.sendMessage(api, `Bạn đã chọn ghim ${name}(${username})!`);
			break;
		case gameConfig.code.THOSAN_TREOCO:
			await this.sendMessage(api, `Bạn đã pắn chít ${name}(${username})!`);
			break;
		}
	}

	async onNightEnd(api, code, value) {
		if (!value) return;
		await super.onNightEnd(api, code, value);
		if (code == gameConfig.code.THOSAN_NIGHT)
			this.pinnedIndex = value - 1;
	}

	async onNight(api) {
		const game = kb2abot.gameManager.find({id: this.gameID});
		await game.u_timingSend({
			api,
			message: "Đêm nay bạn muốn ghim ai?\n" +
							game.chat_playerList({died: false}),
			timing: gameConfig.timeout.THOSAN_NIGHT,
			threadID: this.threadID
		});
		return [await this.request(gameConfig.code.THOSAN_NIGHT, gameConfig.timeout.THOSAN_NIGHT)];
	}

	async die(api, killerType) {
		await super.die();
		const game = kb2abot.gameManager.find({id: this.gameID});
		if (killerType == null) { // type null = vote kill
			await game.u_timingSend({
				api,
				message: "Bạn đang bị cả làng bao vây treo cổ.\n" +
					"Nhận ra trong túi bạn có khẩu 3579, bạn có muốn dứt ai lẹ không?\n" +
					game.chat_playerList({died: false}),
				timing: gameConfig.timeout.THOSAN_TREOCO,
				threadID: this.threadID
			});
			const commit = await this.request(gameConfig.code.THOSAN_TREOCO, gameConfig.timeout.THOSAN_TREOCO);
			const deadPlayer = game.playerManager.items[commit.value-1];
			await game.sendMessage(api, "*BẰNG*");
			await deadPlayer.sendMessage(api, "Bạn đã bị trúng đạn :/ \n*die");
			await asyncWait(2000);
			await game.sendMessage(
				api,
				`Người chơi ${deadPlayer.name}(${deadPlayer.username}) xấu số đã bị bắn bởi ${this.name}(${this.username})!`
			);
			await deadPlayer.die(api);
		} else {
			const deadPlayer = game.playerManager.items[this.pinnedIndex];
			await game.sendMessage(api, "*PẰNG*");
			await deadPlayer.sendMessage(api, "Bạn đã bị trúng đạn :/ \n*die");
			await game.sendMessage(
				api,
				`Người chơi ${deadPlayer.name}(${deadPlayer.username}) xấu số đã bị bắn bởi ${this.name}(${this.username})!`
			);
			await deadPlayer.die(api);
		}
	}
};
