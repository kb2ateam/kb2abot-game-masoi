const Role = require('./Role');
const {asyncWait, random, shuffle} = kb2abot.helpers;
const gameConfig = require('../gameConfig');
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

module.exports = class Mason extends Role {
	constructor(options) {
		super({
			...{
				type: 'Mason'
			},
			...options
		});
	}



	async die(killerType) {
		await super.die();

		if (killerType == null) {
			// type null = vote kill
		var pinnedindex = -1;
		for(var i = 0, len = this.game.playerManager.items.length; i < len; i++) {
    		if (this.game.playerManager.items[i].type == "Mason" && !this.game.playerManager.items[i].died ) {
        	pinnedindex = i;
        	break;
    }}			
	if (pinnedindex != -1) {
		try {
			this.testCommit(pinnedindex);
		} catch {
			return;
		}
		//await this.game.sendMessage(`Index là: ${pinnedindex}`);
			const deadPlayer = this.game.playerManager.items[pinnedindex];
			// await this.game.sendMessage('*BẰNGGGGGGGGGGGG*');
			// await deadPlayer.sendMessage('Bạn đã bị trúng đạn :/ \n*die');
			
			if(!deadPlayer.died){
				await asyncWait(2000);
				await this.game.sendMessage(
					`☀️ ${deadPlayer.name} đã ${
						lmao[random(0, lmao.length - 1)]
					}`
				);}
			await deadPlayer.die('Mason');
				}
		
	}	else {
	

	
		var pinnedindex2 = -1;
		for(var i = 0, len = this.game.playerManager.items.length; i < len; i++) {
    		if (this.game.playerManager.items[i].type == "Mason" && !this.game.playerManager.items[i].died ) {
        	pinnedindex2 = i;
        	break;
    }}			

	if (pinnedindex2 != -1) {
		try {
			this.testCommit(pinnedindex2);
		} catch {
			return;
		}
			//await this.game.sendMessage(`Index là: ${pinnedindex2}`);
			const deadPlayer = this.game.playerManager.items[pinnedindex2];
				// await this.game.sendMessage('*PẰNG*');
				// await deadPlayer.sendMessage('Bạn đã bị trúng đạn :/ \n*die');
			
				if(!deadPlayer.died){
				await asyncWait(2000);
				await this.game.sendMessage(
					`☀️ ${deadPlayer.name} đã ${
						lmao[random(0, lmao.length - 1)]
					}`
				);}
				await deadPlayer.die('Mason');
				}
				}	
	}

};
