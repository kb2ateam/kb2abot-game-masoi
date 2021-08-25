const Role = require('./Role');
const gameConfig = require('../gameConfig');
const {asyncWait, random, shuffle} = kb2abot.helpers;

module.exports = class SoiAnChay extends Role {
	constructor(options) {
		super({
			...{
				type: 'SoiAnChay'
			},
			...options
		});
	}


    async onNight() {
		const requests = [];

		let alone = false;
		const arraytri = Array.from(this.game.playerManager.items);
		const werewolfs = arraytri.filter(
			player => (player.type == "SoiThuong") || (player.type == "SoiTienTri")
		);
		
		const alives = werewolfs.filter(wolves => !wolves.died);

		if ((alives.length <= 0)){
			alone = true;
		}


		if ((alone == true) && this.type == 'SoiAnChay') {
			await asyncWait(2000);
			await this.sendMessage(
				'🐺 Chỉ còn bạn trong phe Sói nhưng bạn ăn chay nên không thể cắn người !\n🐺 Hãy tiếp tục làm cho dân làng nghi ngờ lẫn nhau nhé !'
			);
		}
		return requests;
    }
};
