const Role = require('./Role');
const gameConfig = require('../gameConfig');
const {asyncWait, random, shuffle} = kb2abot.helpers;
const lmao = [
	'💀',
	'👽',
	'👻',
	'💩',
	'😈',
	'🌚',
	'🧟‍♂️',
	'🧟‍♀️',
	'👾'
];

module.exports = class Revealer extends Role {
	constructor(options) {
		super({
			...{
				type: 'Revealer'
			},
			...options
		});
		this.lastRevealIndex = -1;
	}

	commitChecker(code, value) {
		if (code == gameConfig.code.VOTEKILL)
			return super.commitChecker(code, value);

		this.testCommit(value, this.isAlive, this.isNotSelf);
		//if (this.lastMuteIndex == value - 1) {
			//throw new Error('⚠️ Không được khoá mõm 2 lần liên tục cùng 1 người!');
		//}
		//const {name, username} = this.game.playerManager.items[value - 1];
		// this.sendMessage(`🤐 Đã chọn khoá mõm ${name}!`);
	}

	async onNightEnd(code, value) {
		if (!value) return;
		await super.onNightEnd(code, value);
		this.lastRevealIndex = value - 1;
        if (this.lastRevealIndex != -1){
        const revealedPlayer = this.game.playerManager.items[this.lastRevealIndex]; 
        if (revealedPlayer.type == "SoiThuong" || revealedPlayer.type == "SoiTienTri" || revealedPlayer.type == "SoiAnChay"){
		
        if(!revealedPlayer.died){
		await asyncWait(2000);
        await this.game.sendMessage(
            `☀️ ${revealedPlayer.name} đã ${
                lmao[random(0, lmao.length - 1)]
            }  `
        );}
        this.game.playerManager.items[this.lastRevealIndex].die('Revealer')
        } else {
			
            if(!this.died){
				await asyncWait(2000);
                await this.game.sendMessage(
                    `☀️ ${this.name} đã ${
                        lmao[random(0, lmao.length - 1)]
                    }  `
                );}
        this.die('Revealer');

        }
    }
	}

	async onNight() {
		
		await this.timingSend({
			message:
				'🎰 Ai là Sói ?\n❗ Nếu đoán sai bạn sẽ chết ❗\n' +
				this.game.chat_playerList({died: false}),
			timing: gameConfig.timeout.REVEALER
		});
		return [
			await this.request(gameConfig.code.REVEALER, gameConfig.timeout.REVEALER)
		];
	}
};
