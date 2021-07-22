const Role = require('./Role');
const gameConfig = require('../gameConfig');
const {asyncWait, random, shuffle} = kb2abot.helpers;

module.exports = class ThayDong extends Role {
	constructor(options) {
		super({
			...{
				type: 'ThayDong'
			},
			...options
		});

        this.potion = {
			realive: true
		};
		 this.lastRealiveIndex = -1;
         this.diedexist = true;

	}

	commitChecker(code, value) {
		if (code == gameConfig.code.VOTEKILL)
			return super.commitChecker(code, value);

			// this.testCommit(value, this.isDead, this.isNotSelf);
        // if(code == gameConfig.code.THAYDONG) {
        //         this.testCommit(value, this.isDead);
        //         break;
        //     }
		switch (code) {
		case gameConfig.code.THAYDONG:
		 this.testCommit(value, this.isDead, this.isNotSelf);
		 break;
		}
		//  if (this.lastProtectIndex == value - 1) {
		// 	throw new Error('⚠️ Không được bảo vệ 2 lần cho cùng 1 người chơi!');
		//  }
		// const {name, username} = this.game.playerManager.items[value - 1];
		// this.sendMessage(`✨ Đã chọn bảo vệ ${name}!`);
	}

	async onNightEnd(code, value) {
		if (!value) return;
		await super.onNightEnd(code, value);
        
		this.lastRealiveIndex = value - 1;
        const realivedPlayer = this.game.playerManager.items[this.lastRealiveIndex];
        this.game.playerManager.items[this.lastRealiveIndex].died = false;
		 switch (code) {
         case gameConfig.code.THAYDONG:
                 this.potion.realive = false;
                 break;
             }
			 await asyncWait(1000);
        await this.game.sendMessage(
            `<------------------->\n☀️ ${realivedPlayer.name} đã được hồi sinh 🃏\n<------------------->`
        );
	}

	async onNight() {
		const requests = [];
         
    //     for (let index = 0; index < this.game.playerManager.getLength(); index++) {
	// 		const player = this.game.playerManager.items[index];
    //          if(player.died == false){
    //          return [];
    //         }
    //   }
		let deadCount = 0;
	for (const player of this.game.playerManager.items){
		if (player.died){
			deadCount++;
		}
	}

        if( (this.potion.realive) && (deadCount > 0) ){
        await asyncWait(1000);
		await this.timingSend({
			message:
				'🌙 Đêm nay hồi sinh ai?\nKhông có ai hoặc không hồi sinh thì nhắn "pass"\n' +
				this.game.chat_playerList({died: true}),
			timing: gameConfig.timeout.THAYDONG
		});
		requests.push(
			await this.request(
                gameConfig.code.THAYDONG, 
                gameConfig.timeout.THAYDONG
				)
		);
    }
	return requests;
    }
};
