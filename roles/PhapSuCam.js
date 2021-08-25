const Role = require('./Role');
const gameConfig = require('../gameConfig');
const {asyncWait, random, shuffle} = kb2abot.helpers;

module.exports = class PhapSuCam extends Role {
	constructor(options) {
		super({
			...{
				type: 'PhapSuCam'
			},
			...options
		});
		this.lastMuteIndex = -1;
	}

	commitChecker(code, value) {
		if (code == gameConfig.code.VOTEKILL)
			return super.commitChecker(code, value);

		this.testCommit(value, this.isAlive);
		if (this.lastMuteIndex == value - 1) {
			throw new Error('⚠️ Không được khoá mõm 2 lần liên tục cùng 1 người!');
		}
		const {name, username} = this.game.playerManager.items[value - 1];
		// this.sendMessage(`🤐 Đã chọn khoá mõm ${name}!`);
	}

	async onNightEnd(code, value) {
		if (!value) return;
		await super.onNightEnd(code, value);
		this.lastMuteIndex = value - 1;
        const mutedPlayer = this.game.playerManager.items[this.lastMuteIndex]; 
		
        await this.game.sendMessage(
            `<------------------->\n☀️ ${mutedPlayer.name} đã bị khoá mõm vì nói nhiều 🤐\n<------------------->`
        );
	}

	async onNight() {
	
		await this.timingSend({
			message:
				'🤐 Đêm nay khoá mõm ai?\n' +
				this.game.chat_playerList({died: false}),
			timing: gameConfig.timeout.PHAPSUCAM
		});
		return [
			await this.request(gameConfig.code.PHAPSUCAM, gameConfig.timeout.PHAPSUCAM)
		];
	}
};
