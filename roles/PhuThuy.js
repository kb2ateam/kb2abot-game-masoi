const Role = require("./Role");
const gameConfig = require("../gameConfig");
const {sendMessage} = kb2abot.helpers.fca;

module.exports = class PhuThuy extends Role {
	constructor(options) {
		super({
			...{
				type: "PhuThuy"
			},
			...options,
		});
		this.potion = {
			save: true,
			kill: true
		};
		this.iPlayerKilledByWolf = -1;
	}

	async commitChecker(api, code, value) {
		await super.commitChecker(api, code, value);
		if (code == gameConfig.code.VOTEKILL) return;

		this.testCommit(value, this.isNumber);
		const game = kb2abot.gameManager.find({id: this.gameID});
		switch (code) {

		case gameConfig.code.PHUTHUY_CUU: {
			if (this.potion.save) {
				if (!["1", "2"].includes(value))
					throw new Error("Vui lòng nhập 1 (cứu sống) hoặc 2 (không cứu)!");
			} else
				throw new Error("Bạn đã sử dụng bình [cứu người] rồi!");
			const {name, username} = game.playerManager.items[this.iPlayerKilledByWolf];
			await sendMessage(api, `Bạn đã chọn ${value == 1?"CỨU SỐNG": "KHÔNG CỨU"} ${name}(${username})!`, this.threadID);
			break;
		}

		case gameConfig.code.PHUTHUY_GIET: {
			if (!this.potion.kill)
				throw new Error("Bạn đã sử dụng bình [giết người] rồi!");
			this.testCommit(
				value,
				this.isValidPlayerIndex,
				this.isAlive,
				this.isNotSelf
			);
			const {name, username} = game.playerManager.items[value-1];
			await sendMessage(api, `Bạn đã chọn giết ${name}(${username})!`, this.threadID);
			break;
		}

		}
	}

	async onNightEnd(api, code, value) {
		if (!value) return;
		await super.onNightEnd(api, code, value);
		switch (code) {
		case gameConfig.code.PHUTHUY_CUU:
			if (value == 1)
				this.potion.save = false;
			break;
		case gameConfig.code.PHUTHUY_GIET:
			this.potion.kill = false;
			break;
		}
	}

	async onNight(api) {
		const requests = [];
		const game = kb2abot.gameManager.find({id: this.gameID});

		if (this.potion.save) {

			if (game.history_last()) {
				const movements = game.history_last().movements;
				let iPlayerKilledByWolf = game.u_getIPlayerKilledByWolf(movements);
				this.iPlayerKilledByWolf = iPlayerKilledByWolf;

				if (iPlayerKilledByWolf != -1) { // not tie
					const {name, username} = game.playerManager.items[iPlayerKilledByWolf];
					await sendMessage(
						api,
						`[30s] Đêm nay ${name}(${username}) sẽ bị lũ sói cắn, bạn có muốn sử dụng bình [cứu người] không? (1 lần duy nhất)\n` +
						`${gameConfig.symbols[1]} Có ♥\n` +
						`${gameConfig.symbols[2]} Không 😈`,
						this.threadID
					);
					requests.push(await this.request(gameConfig.code.PHUTHUY_CUU, gameConfig.timeout.PHUTHUY_CUU));
				}
			} else {
				await sendMessage(
					api,
					"Đêm nay không có ai bị cắn!",
					this.threadID
				);
			}
		}

		if (this.potion.kill) {
			await sendMessage(
				api,
				`[30s] Bạn có muốn sử dụng ${requests.length>0?"thêm ":""}bình [giết người] để giết ai không? (1 lần duy nhất)\n` +
				game.chat_playerList({died: false}),
				this.threadID
			);
			requests.push(await this.request(gameConfig.code.PHUTHUY_GIET, gameConfig.timeout.PHUTHUY_GIET));
		}

		return requests;
	}
};
