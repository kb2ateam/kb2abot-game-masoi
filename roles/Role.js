const gameConfig = require('../gameConfig');

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
			await reply('Bạn đã bỏ lượt!');
			break;
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
		return new Promise(resolve => {
			this.code = code;
			this.state.next();

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
					this.sendMessage('Time out!');
				}
			}, timeout);
		});
	}

	async voteKill() {
		await this.timingSend({
			message:
				'Vui lòng chọn 1 trong mấy người chơi dưới đây để vote treo cổ\n' +
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
			this.sendMessage(`Bạn đã vote ${name}(${username})!`);
		}
	}

	testCommit(value, ...tests) {
		for (let index = 0; index < tests.length; index++) {
			if (Array.isArray(tests[index])) {
				if (!tests[index].includes(value))
					throw new Error(
						`Vui lòng nhập 1 trong các giá trị sau: ${tests[index].join(', ')}!`
					);
			} else tests[index].bind(this)(value);
		}
	}

	isNumber(value) {
		if (isNaN(parseInt(value))) throw new Error('Vui lòng nhập số');
	}

	isValidPlayerIndex(value) {
		this.isNumber(value);
		if (value < 1 || value > this.game.playerManager.getLength())
			throw new Error('Bạn cần nhập số trong khoảng đã cho!');
	}

	isAlive(value) {
		this.isValidPlayerIndex(value);
		if (this.game.playerManager.items[value - 1].died)
			throw new Error('Người chơi này đã chết!');
	}

	isNotSelf(value) {
		this.isValidPlayerIndex(value);
		const curIndex = this.game.playerManager.find(
			{threadID: this.threadID},
			true
		);
		if (curIndex == value - 1)
			throw new Error('Bạn không thể chọn bản thân được!');
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
