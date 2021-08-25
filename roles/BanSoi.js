const Role = require('./Role');
const gameConfig = require('../gameConfig');
const {asyncWait, random, shuffle} = kb2abot.helpers;

module.exports = class BanSoi extends Role {
	constructor(options) {
		super({
			...{
				type: 'BanSoi'
			},
			...options
		});
	}

	commitChecker(code, value) {
		if (code == gameConfig.code.VOTEKILL)
			return super.commitChecker(code, value);

		switch (code) {
		case gameConfig.code.BANSOI_VOTE: {
			this.testCommit(value, this.isAlive, this.isNotSelf);
			const {name, username} = this.game.playerManager.items[value - 1];
			//this.sendMessage(`Bạn đã chọn cắn ${name}(${username})!`);
			break;
		}
		}
	}

	async onNightEnd(code, value) {
		if (!value) return;
		await super.onNightEnd(code, value);

		// switch (code) {
		// case gameConfig.code.SOITIENTRI_RESIGN:
		// 	if (value == 1) this.type = 'SoiThuong';
		// 	break;
		// case gameConfig.code.SOITIENTRI_SEER: {
		// 	const {name, username, type} = this.game.playerManager.items[value - 1];
		// 	const party = gameConfig.data[type].party > 0 ? 'Dân Làng' : 'Sói';
		// 	await this.sendMessage(`🔮 Role của ${name} là ${type}`);
		// 	break;
		// }
		// }
	}

	async onNight() {
		const requests = [];

		
        if (this.type == 'SoiThuong')  {
			// SoiThuong
            
			await this.timingSend({
				message: '🐺 Đêm nay cắn ai? 💀 \n' + this.game.chat_playerList(),
				timing: gameConfig.timeout.SOITIENTRI_VOTE
			});
			requests.push(
				await this.request(
					gameConfig.code.BANSOI_VOTE,
					gameConfig.timeout.BANSOI_VOTE
				)
			);
		}

		return requests;
	}
};
