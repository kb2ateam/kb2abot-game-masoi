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
		// case gameConfig.code.SOITIENTRI_RESIGN:
		// 	this.testCommit(value, ['1', '2']);
		// 	if (value == 1)
		// 		this.sendMessage('🐺 Sẽ biến về Sói Thường sau đêm nay');
		// 	break;
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
		// case gameConfig.code.SOITIENTRI_RESIGN:
		// 	if (value == 1) this.type = 'SoiThuong';
		// 	break;
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

		let alone = false;
		const arraytri = Array.from(this.game.playerManager.items);
		const werewolfs = arraytri.filter(
			player => (player.type == "SoiThuong")
		);
		
		const alives = werewolfs.filter(wolves => !wolves.died);

		if ((alives.length <= 0)){
			alone = true;
		}

		if ((alone == true) && this.type == 'SoiTienTri') {
			//this.type = 'SoiThuong';
			await this.sendMessage(
				'🐺 Bạn sẽ cắn người vì Sói Thường đã chết hết!\n⚠️BẮT BUỘC CHỌN CÙNG 1 NGƯỜI 2 LẦN(NẾU CÓ), NẾU KHÔNG SẼ KHÔNG CẮN ĐƯỢC!⚠️'
			);
		}

		if ((alone == false) && this.type == 'SoiTienTri') {
			
			// await this.timingSend({
			// 	message:
			// 		'Biến thành Sói Thường không? (Sói Tiên Tri không thể cắn người)\n' +
			// 		`${gameConfig.symbols[1]} Có ♥\n` +
			// 		`${gameConfig.symbols[2]} Không 😈`,
			// 	timing: gameConfig.timeout.SOITIENTRI_RESIGN
			// });
			// const data = await this.request(
			// 	gameConfig.code.SOITIENTRI_RESIGN,
			// 	gameConfig.timeout.SOITIENTRI_RESIGN
			// );
			// requests.push(data);

				await this.timingSend({
					message: '🔮 Đêm nay soi ai? \n' + this.game.chat_playerList({died: false}),
					timing: gameConfig.timeout.SOITIENTRI_SEER
				});
				requests.push(
					await this.request(
						gameConfig.code.SOITIENTRI_SEER,
						gameConfig.timeout.SOITIENTRI_SEER
					)
				);
			
		} 
		if ((alone == true) && this.type == 'SoiTienTri') {
			// SoiThuong
			await this.timingSend({
				message: '🐺 Đêm nay cắn ai? 💀\n⚠️LƯU Ý!! BẮT BUỘC CHỌN CÙNG 1 NGƯỜI 2 LẦN(NẾU CÓ), NẾU KHÔNG SẼ KHÔNG CẮN ĐƯỢC!⚠️\n' + this.game.chat_playerList({died: false}),
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
