const Role = require('./Role');
const gameConfig = require('../gameConfig');
const {asyncWait, random, shuffle} = kb2abot.helpers;

module.exports = class SoiTienTri extends Role {
	constructor(options) {
		super({
			...{
				type: 'SoiTienTri'
			},
			...options
		});
	}

	commitChecker(code, value) {
		if (code == gameConfig.code.VOTEKILL)
			return super.commitChecker(code, value);

		switch (code) {
		case gameConfig.code.SOITIENTRI_RESIGN:
			this.testCommit(value, ['1', '2']);
			if (value == 1)
				this.sendMessage('🐺 Sẽ biến về Sói Thường sau đêm nay');
			break;
		case gameConfig.code.SOITIENTRI_SEER: {
			this.testCommit(value, this.isNotSelf);
			const {name, username} = this.game.playerManager.items[value - 1];
			//this.sendMessage(`Bạn đã chọn xem role của ${name}(${username})!`);
			break;
		}
		case gameConfig.code.SOITIENTRI_VOTE: {
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

		switch (code) {
		case gameConfig.code.SOITIENTRI_RESIGN:
			if (value == 1) this.type = 'SoiThuong';
			break;
		case gameConfig.code.SOITIENTRI_SEER: {
			const {name, username, type} = this.game.playerManager.items[value - 1];
			const party = gameConfig.data[type].party > 0 ? 'Dân Làng' : 'Sói';
			await this.sendMessage(`🔮 Role của ${name} là ${type}`);
			break;
		}
		}
	}

	async onNight() {
		const requests = [];

		let alone = true;
		for (const player of this.game.playerManager.items) {
			if (gameConfig.data[player.type].party == -1 && player != this && !player.died) {
				alone = false;
				break;
			}
		}
		if ((alone) && this.type == 'SoiTienTri') {
			this.type = 'SoiThuong';
			await asyncWait(1000);
			await this.sendMessage(
				'🐺 Chỉ còn bạn trong phe Sói nên đã trở thành Sói Thường!\n⚠️LƯU Ý!! Bắt buộc chọn cùng 1 người 2 lần, nếu không sẽ không cắn được!'
			);
		}

		if (this.type == 'SoiTienTri') {
			await asyncWait(1000);
			await this.timingSend({
				message:
					'Biến thành Sói Thường không? (Sói Tiên Tri không thể cắn người)\n' +
					`${gameConfig.symbols[1]} Có ♥\n` +
					`${gameConfig.symbols[2]} Không 😈`,
				timing: gameConfig.timeout.SOITIENTRI_RESIGN
			});
			const data = await this.request(
				gameConfig.code.SOITIENTRI_RESIGN,
				gameConfig.timeout.SOITIENTRI_RESIGN
			);
			requests.push(data);
			if (data.value == '2') {
				await asyncWait(1000);
				await this.timingSend({
					message: '🔮 Đêm nay soi ai? \n' + this.game.chat_playerList(),
					timing: gameConfig.timeout.SOITIENTRI_SEER
				});
				requests.push(
					await this.request(
						gameConfig.code.SOITIENTRI_SEER,
						gameConfig.timeout.SOITIENTRI_SEER
					)
				);
			}
		} else {
			// SoiThuong
			await asyncWait(1000);
			await this.timingSend({
				message: '🐺 Đêm nay cắn ai? 💀\n⚠️LƯU Ý!! Bắt buộc chọn cùng 1 người 2 lần, nếu không sẽ không cắn được!\n' + this.game.chat_playerList(),
				timing: gameConfig.timeout.SOITIENTRI_VOTE
			});
			requests.push(
				await this.request(
					gameConfig.code.SOITIENTRI_VOTE,
					gameConfig.timeout.SOITIENTRI_VOTE
				)
			);
		}

		return requests;
	}
};
