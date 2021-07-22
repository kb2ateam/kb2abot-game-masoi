const Role = require('./Role');
const gameConfig = require('../gameConfig');
const {asyncWait, random, shuffle} = kb2abot.helpers;

module.exports = class PhuThuy extends Role {
	constructor(options) {
		super({
			...{
				type: 'PhuThuy'
			},
			...options
		});
		this.potion = {
			save: true,
			kill: true
		};
		this.iPlayerKilledByWolf = -1;
	}

	commitChecker(code, value) {
		if (code == gameConfig.code.VOTEKILL)
			return super.commitChecker(code, value);

		switch (code) {
		case gameConfig.code.PHUTHUY_CUU: {
			this.testCommit(value, ['1', '2']);
			const {name, username} = this.game.playerManager.items[
				this.iPlayerKilledByWolf
			];
			// this.sendMessage(
			// 	`💉 Đã chọn ${
			// 		value == 1 ? 'CỨU SỐNG' : 'KHÔNG CỨU'
			// 	} ${name}!`
			// );
			break;
		}

		case gameConfig.code.PHUTHUY_GIET: {
			this.testCommit(value, this.isAlive, this.isNotSelf);
			const {name, username} = this.game.playerManager.items[value - 1];
			// this.sendMessage(`🧪 Đã chọn giết ${name}!`);
			break;
		}
		}
	}

	async onNightEnd(code, value) {
		if (!value) return;
		await super.onNightEnd(code, value);
		switch (code) {
		case gameConfig.code.PHUTHUY_CUU:
			if (value == 1) this.potion.save = false;
			break;
		case gameConfig.code.PHUTHUY_GIET:
			this.potion.kill = false;
			break;
		}
	}

	async onNight() {
		const requests = [];

		if (this.potion.save) {
			if (this.game.history_last()) {
				const movements = this.game.history_last().movements;
				let iPlayerKilledByWolf = this.game.u_getIPlayerKilledByWolf(movements);
				this.iPlayerKilledByWolf = iPlayerKilledByWolf;

				if (iPlayerKilledByWolf != -1) {
					// not tie
					const {name, username} = this.game.playerManager.items[
						iPlayerKilledByWolf
					];
					await asyncWait(1000);
					await this.timingSend({
						message:
							`💉 Đêm nay ${name} bị lũ Sói cắn, dùng bình [cứu người] không? (1 lần duy nhất)\n` +
							`${gameConfig.symbols[1]} Có ❤️\n` +
							`${gameConfig.symbols[2]} Không 😈`,
						timing: gameConfig.timeout.PHUTHUY_CUU
					});
					requests.push(
						await this.request(
							gameConfig.code.PHUTHUY_CUU,
							gameConfig.timeout.PHUTHUY_CUU
						)
					);
				}
			} else {
				await this.sendMessage('📍 Đêm nay không ai bị cắn!');
			}
		}
		

		if (this.potion.kill) {
			await asyncWait(1000);
			await this.timingSend({
				message:
					`🧪 Dùng ${
						requests.length > 0 ? 'thêm ' : ''
					}bình [giết người] để giết ai không? (1 lần duy nhất)\n ⚠️ Nếu không muốn giết ai hãy nhập "pass"\n` +
					this.game.chat_playerList({died: false}),
				timing: gameConfig.timeout.PHUTHUY_GIET
			});
			requests.push(
				await this.request(
					gameConfig.code.PHUTHUY_GIET,
					gameConfig.timeout.PHUTHUY_GIET
				)
			);
		}
		return requests;
	}
};
