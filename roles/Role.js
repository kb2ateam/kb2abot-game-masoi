const gameConfig = require('../gameConfig');
const {asyncWait, random, shuffle} = kb2abot.helpers;

module.exports = class Role {
	constructor({game, name, username, type, threadID, gameID} = {}) {
		this.game = game;
		this.name = name; // name of user
		this.username = username;
		this.type = type;
		this.threadID = threadID;
		this.gameID = gameID; // the game ID (id from schemas not from fca)
		this.state = new kb2abot.helpers.State([
			'idle', // do nothing
			'waitresponse', // wait for response from chat client
			'resolved' // resolved data
		]);
		this.died = false;

		// commit
		this.committedValue = null;
		this.code = null;
	}

	async onMessage(message, reply) {
		if (!this.state.is('waitresponse')) return;
		switch (message.body.toLowerCase()) {
		case 'pass':
			this.commit(null);
			// await reply('Đã bỏ lượt❌');
			break;
		
		case 'rand':{
			var array = [];
	for(let i = 1;i <= this.game.playerManager.items.length; i++){
			const curIndex = this.game.playerManager.find(
			{threadID: this.threadID},
			true
			);
		if((this.game.playerManager.items[i - 1].died == false) && (curIndex !== i - 1))
			{
			array.push(i);
				}
}
	
	//var randomValue = Math.floor(Math.random() * array.length);
	var randomValue = array[random(0,array.length-1)];
				await asyncWait(1500);
				//this.sendMessage(`🔥 Random vote player ${randomValue}!\n🔥 Any bug please inbox Andrei!`);
				this.commitChecker(this.code, randomValue);
				this.commit(randomValue);
				break;
		}


		default:
			try {
				this.commitChecker(this.code, message.body);
				this.commit(message.body);
			} catch (e) {
				await reply(e.message);
			}
			break;
		}
	}

	request(code, timeout = 30000) {
		if (!this.state.is('idle')) return;
		this.state.next();
		return new Promise(resolve => {
			this.code = code;

			let _interval, _timeout;

			_interval = setInterval(() => {
				if (this.state.is('resolved')) {
					clearInterval(_interval);
					clearTimeout(_timeout);
					const commit = this.getCommit();
					this.state.reset();
					this.committedValue = null;
					this.code = null;
					resolve(commit); // resolve phai de o cuoi cung
				}
			}, 1000);

			_timeout = setTimeout(() => {
				if (this.state.is('waitresponse')) {
					this.commit(null);
					this.sendMessage('Time out 😡');
				}
			}, timeout);
		});
	}

	async voteKill() {
		await asyncWait(1000);
		await this.timingSend({
			message:
				'🔥 Chọn 1 người để vote treo cổ\n⚠️ Random vote bằng cách nhắn "rand" !\n⚠️ Bỏ qua vote bằng cách nhắn "pass" !\n' +
				this.game.chat_playerList({died: false}),
			timing: gameConfig.timeout.VOTEKILL
		});
		return await this.request(
			gameConfig.code.VOTEKILL,
			gameConfig.timeout.VOTEKILL
		);
	}

	async sendMessage(message, threadID = this.threadID) {
		await kb2abot.helpers.fca.sendMessage(message, threadID);
	}

	async timingSend(options) {
		await this.game.u_timingSend({
			...options,
			threadID: options.threadID || this.threadID
		});
	}

	commit(value) {
		if (!this.state.is('waitresponse')) return;
		this.state.next();
		this.committedValue = value;
	}

	getCommit() {
		return {
			code: this.code,
			value: this.committedValue
		};
	}

	// --> commit checker
	commitChecker(code, value) {
		if (code == gameConfig.code.VOTEKILL) {
			this.testCommit(value, this.isAlive, this.isNotSelf);
			const {name, username} = this.game.playerManager.items[value - 1];
			// this.sendMessage(`🔥 Đã vote ${name}`);
		}
	}

	testCommit(value, ...tests) {
		for (let index = 0; index < tests.length; index++) {
			if (Array.isArray(tests[index])) {
				if (!tests[index].includes(value))
					throw new Error(
						`⚠️ Hãy nhập 1 trong các giá trị sau: ${tests[index].join(', ')}!`
					);
			} else tests[index].bind(this)(value);
		}
	}

	isNumber(value) {
		if (isNaN(parseInt(value))) throw new Error('⚠️ Hãy nhập số!');
	}

	isValidPlayerIndex(value) {
		this.isNumber(value);
		if (value < 1 || value > this.game.playerManager.getLength())
			throw new Error('⚠️ Hãy nhập số trong khoảng đã cho!');
	}

	isAlive(value) {
		this.isValidPlayerIndex(value);
		if (this.game.playerManager.items[value - 1].died)
			throw new Error('⚠️ Người này đã chết!');
	}

	isDead(value){
		this.isValidPlayerIndex(value);
		if (this.game.playerManager.items[value - 1].died == false)
			throw new Error('⚠️ Người này còn sống!');

	}

	isNotSelf(value) {
		this.isValidPlayerIndex(value);
		const curIndex = this.game.playerManager.find(
			{threadID: this.threadID},
			true
		);
		if (curIndex == value - 1)
			throw new Error('⚠️ Không thể chọn bản thân!');
	}
	// <-- commit checker

	async onNightEnd(code, value) {}

	async onNight() {
		return [];
	}

	async die() {
		this.died = true;
	}
};
