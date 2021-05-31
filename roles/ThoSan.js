const Role = require('./Role');
const gameConfig = require('../gameConfig');
const {asyncWait} = kb2abot.helpers;

module.exports = class ThoSan extends Role {
	constructor(options) {
		super({
			...{
				type: 'ThoSan'
			},
			...options
		});
		this.pinnedIndex = -1;
	}

	commitChecker(code, value) {
		if (code == gameConfig.code.VOTEKILL)
			return super.commitChecker(code, value);

		this.testCommit(value, this.isAlive, this.isNotSelf);

		const {name, username} = this.game.playerManager.items[value - 1];
		switch (code) {
		case gameConfig.code.THOSAN_NIGHT:
			this.sendMessage(`Bạn đã chọn ghim ${name}(${username})!`);
			break;
		case gameConfig.code.THOSAN_TREOCO:
			this.sendMessage(`Bạn đã bắn ${name}(${username})!`);
			break;
		}
	}

	async onNightEnd(code, value) {
		if (!value) return;
		await super.onNightEnd(code, value);
		if (code == gameConfig.code.THOSAN_NIGHT) this.pinnedIndex = value - 1;
	}

	async onNight() {
		if (this.pinnedIndex != -1) return [];
		await this.timingSend({
			message:
				'Đêm nay bạn muốn ghim ai?\n' +
				this.game.chat_playerList({died: false}),
			timing: gameConfig.timeout.THOSAN_NIGHT
		});
		return [
			await this.request(
				gameConfig.code.THOSAN_NIGHT,
				gameConfig.timeout.THOSAN_NIGHT
			)
		];
	}

	async die(killerType) {
		await super.die();

		if (killerType == null) {
			// type null = vote kill
			await this.timingSend({
				message:
					'Bạn đang bị cả làng bao vây treo cổ.\n' +
					'Nhận ra trong túi bạn có khẩu Revolver, bạn có muốn dứt ai lẹ không?\n' +
					this.game.chat_playerList({died: false}),
				timing: gameConfig.timeout.THOSAN_TREOCO
			});
			const commit = await this.request(
				gameConfig.code.THOSAN_TREOCO,
				gameConfig.timeout.THOSAN_TREOCO
			);
			if (!commit.value) return;
			const deadPlayer = this.game.playerManager.items[commit.value - 1];
			await this.game.sendMessage('*BẰNG*');
			await deadPlayer.sendMessage('Bạn đã bị trúng đạn :/ \n*die');
			await asyncWait(2000);
			await this.game.sendMessage(
				`Người chơi ${deadPlayer.name}(${deadPlayer.username}) xấu số đã bị bắn bởi ${this.name}(${this.username})!`
			);
			await deadPlayer.die();
		} else {
			if (this.pinnedIndex != -1) {
				try {
					this.testCommit(this.pinnedIndex, this.isAlive);
				} catch {
					return;
				}
				const deadPlayer = this.game.playerManager.items[this.pinnedIndex];
				await this.game.sendMessage('*PẰNG*');
				await deadPlayer.sendMessage('Bạn đã bị trúng đạn :/ \n*die');
				await this.game.sendMessage(
					`Người chơi ${deadPlayer.name}(${deadPlayer.username}) xấu số đã bị bắn bởi ${this.name}(${this.username})!`
				);
				await deadPlayer.die();
			} else {
				await this.sendMessage(
					'Mấy đêm trước bạn chưa ghim ai nên không thể bắn trước khi chết!'
				);
			}
		}
	}
};
