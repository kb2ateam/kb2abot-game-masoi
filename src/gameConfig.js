// Phiên bản của file config, nếu khác thì phải xóa file gameConfig.js
// Một file gameConfig.js sẽ đc tạo lại sau khi run lại bot
module.exports.ready = 'meplay';

//  ____  _____ _____ _   _ ____  ____
// / ___|| ____|_   _| | | |  _ \/ ___|
// \___ \|  _|   | | | | | | |_) \___ \
//  ___) | |___  | | | |_| |  __/ ___) |
// |____/|_____| |_|  \___/|_|   |____/
module.exports.setups = [
	{
		name: '🔮 Làng của tiên tri',
		roles: {
			Apprentice: 1,
			Bodyguard: 0,
			Cupid: 1,
			Evilseer: 1,
			Fruitbrute: 0,
			Goodseer: 1,
			Hunter: 0,
			Investigator: 0,
			Lycan: 0,
			Oldman: 1,
			Tanner: 0,
			Villager: 0,
			Werewolf: 0,
			Witch: 0
		}
	},
	{
		name: 'Làng của cái chết',
		roles: {
			Goodseer: 1,
			Witch: 1,
			Werewolf: 2,
			Villager: 5
		}
	},
	{
		name: 'Làng của sự lưỡng lự',
		roles: {
			Evilseer: 1,
			Goodseer: 1,
			Hunter: 1,
			Lycan: 1,
			Werewolf: 1,
			Villager: 5
		}
	},
	{
		name: 'Làng của sự đền tội',
		roles: {
			Evilseer: 1,
			Goodseer: 1,
			Lonewolf: 1,
			Witch: 1,
			Werewolf: 1,
			Villager: 6
		}
	},
	{
		name: 'Làng nhỏ - Bí mật lớn',
		roles: {
			Auraseer: 1,
			Cupid: 1,
			Cursed: 1,
			Goodseer: 1,
			Lycan: 1,
			Mason: 2,
			Tanner: 1,
			Werewolf: 2,
			Villager: 4
		}
	},
	{
		name: 'Làng sói điển hình',
		roles: {
			Evilseer: 1,
			Goodseer: 1,
			Hunter: 1,
			Mayor: 1,
			Witch: 1,
			Werewolf: 3,
			Villager: 8
		}
	}
];
console.log(module.exports.setups[0]);

//  _____ ___ __  __ _____ ___  _   _ _____
// |_   _|_ _|  \/  | ____/ _ \| | | |_   _|
//   | |  | || |\/| |  _|| | | | | | | | |
//   | |  | || |  | | |__| |_| | |_| | | |
//   |_| |___|_|  |_|_____\___/ \___/  |_|
module.exports.timeout = {
	DELAY_STARTGAME: 1000,
	VOTEKILL: 30000,
	DISCUSS: 10000,
	Bite: 30000,
	Protect: 30000,
	Seer: 30000
};
