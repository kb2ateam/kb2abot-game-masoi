const Role = require('./Role');
const gameConfig = require('../gameConfig');
const {asyncWait, random, shuffle} = kb2abot.helpers;

module.exports = class Vampire extends Role {
	constructor(options) {
		super({
			...{
				type: 'Vampire'
			},
			...options
		});

        this.vampireKilledIndex = -1;
	}


	commitChecker(code, value) {
		if (code == gameConfig.code.VOTEKILL)
			return super.commitChecker(code, value);

            switch (code) {
                case gameConfig.code.VAMPIRE:
                 this.testCommit(value, this.isAlive, this.isNotSelf);
                 break;
                }
		//const {name, username} = this.game.playerManager.items[value - 1];
		// this.sendMessage(`💀 Đã chọn cắn ${name}!`);
	}

    async onNightEnd(code, value) {
		if (!value) return;
		await super.onNightEnd(code, value);
        this.vampireKilledIndex = value - 1;
        switch (code) {
            case gameConfig.code.VAMPIRE:
                if (value != -1) {
                //await this.game.sendMessage(`INDEX KILL PLAYER VAMPIRE ${this.vampireKilledIndex}`) ;
            }
                
                break;
            }
    }

	async onNight() {
        const requests = [];

		await this.timingSend({
			message:
				'🧛 Đêm nay Vampire cắn ai ? 💀💀\n' +
				this.game.chat_playerList({died: false}),
			timing: gameConfig.timeout.VAMPIRE
		});

        requests.push(
            await this.request(
                gameConfig.code.VAMPIRE,
                gameConfig.timeout.VAMPIRE
            )
        );

		return requests;
	}
};
