const Role = require('./Role');
const gameConfig = require('../gameConfig');

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
				this.sendMessage('Bạn sẽ biến về Sói Thường sau đêm nay');
			break;
		case gameConfig.code.SOITIENTRI_SEER: {
			this.testCommit(value, this.isNotSelf);
			const {name, username} = this.game.playerManager.items[value - 1];
			this.sendMessage(`Bạn đã chọn xem role của ${name}(${username})!`);
			break;
		}
		case gameConfig.code.SOITIENTRI_VOTE: {
			this.testCommit(value, this.isAlive, this.isNotSelf);
			const {name, username} = this.game.playerManager.items[value - 1];
			this.sendMessage(`Bạn đã chọn cắn ${name}(${username})!`);
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
			await this.sendMessage(`Phe của ${name}(${username}) là /${party}/`);
			break;
		}
		}
	}

	async onNight() {
		const requests = [];

		let alone = true;
		for (const player of this.game.playerManager.items) {
			if (gameConfig.data[player.type].party == -1 && player != this) {
				alone = false;
				break;
			}
		}
		if (alone) {
			this.type = 'SoiThuong';
			await this.sendMessage(
				'Vì trong phe của bạn không còn ai nên bạn đã trở thành Sói Thường!'
			);
		}

		if (this.type == 'SoiTienTri') {
			await this.timingSend({
				message:
					'Đêm nay bạn có muốn trở về Sói Thường không? (Sói Tiên Tri không thể vote giết)\n' +
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
				await this.timingSend({
					message: 'Đêm nay bạn muốn soi ai? \n' + this.game.chat_playerList(),
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
			await this.timingSend({
				message: 'Đêm nay bạn muốn cắn ai? \n' + this.game.chat_playerList(),
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
