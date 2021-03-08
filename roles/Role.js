const gameConfig = require("../gameConfig");
const {sendMessage} = kb2abot.helpers.fca;

module.exports = class Role {
	constructor({
		name,
		username,
		type,
		threadID,
		gameID
	} = {}) {
		this.name = name; // name of user
		this.username = username;
		this.type = type;
		this.threadID = threadID;
		this.gameID = gameID; // the game ID (id from schemas not from fca)
		this.state = new kb2abot.helpers.State([
			"idle",  		// not do anything
			"waitresponse", // wait for response from chat client
			"resolved"  // resolved data
		]);
		this.died = false;

		// commit
		this.committedValue = null;
		this.code = null;
	}

	async onMessage(api, message) {
		if (this.state.is("waitresponse")) {
			try {
				await this.commitChecker(api, this.code, message.body);
				this.commit(message.body);
			}
			catch(e) {
				await this.sendMessage(api, e.message);
			}
		}
	}

	request(code, timeout = 30000) {
		return new Promise(resolve => {
			this.code = code;
			if (this.state.is("idle")) {
				this.state.next();
			}

			let _interval, _timeout;

			_interval = setInterval(() => {
				if (this.committedValue || this.state.is("resolved")) {
					clearInterval(_interval);
					clearTimeout(_timeout);
					const commit = this.getCommit();
					this.resetRequest();
					resolve(commit);
				}
			}, 1000);
			_timeout = setTimeout(() => {
				if (this.state.is("waitresponse")) {
					clearInterval(_interval);
					this.commit(null);
					const commit = this.getCommit();
					this.resetRequest();
					resolve(commit);
				}
			}, timeout);
		});
	}

	async voteKill(api) {
		const game = kb2abot.gameManager.find({id: this.gameID});
		await game.u_timingSend({
			api,
			message: "Vui lòng chọn 1 trong mấy người chơi dưới đây để vote treo cổ\n" +
								game.chat_playerList({died: false}),
			timing: gameConfig.timeout.VOTEKILL,
			threadID: this.threadID
		});
		return await this.request(gameConfig.code.VOTEKILL, gameConfig.timeout.VOTEKILL);
	}

	async sendMessage(api, message) {
		await sendMessage(api, message, this.threadID);
	}

	commit(value) {
		this.committedValue = value;
		this.state.next();
	}

	getCommit() {
		return {
			code: this.code,
			value: this.committedValue
		};
	}

	resetRequest() {
		this.state.reset();
		this.committedValue = null;
		this.code = null;
	}

	// --> commit checker
	async commitChecker(api, code, value) {
		if (code == gameConfig.code.VOTEKILL) {
			this.testCommit(
				value,
				this.isNumber,
				this.isValidPlayerIndex,
				this.isAlive,
				// this.isNotSelf
			);
			const game = kb2abot.gameManager.find({id: this.gameID});
			const {name, username} = game.playerManager.items[value-1];
			await this.sendMessage(api, `Bạn đã vote ${name}(${username})!`);
		}
	}

	testCommit(value, ...tests) {
		for (let index = 0; index < tests.length; index++) {
			tests[index].bind(this)(value);
		}
	}

	isNumber(value) {
		if (isNaN(parseInt(value)))
			throw new Error("Vui lòng nhập số");
	}

	isValidPlayerIndex(value) {
		const game = kb2abot.gameManager.find({id: this.gameID});
		if (value < 1 || value > game.playerManager.getLength())
			throw new Error("Bạn cần nhập số trong khoảng đã cho!");
	}

	isAlive(value) {
		const game = kb2abot.gameManager.find({id: this.gameID});
		if (game.playerManager.items[value-1].died)
			throw new Error("Người chơi này đã chết!");
	}

	isNotSelf(value) {
		const game = kb2abot.gameManager.find({id: this.gameID});
		const curIndex = game.playerManager.find({threadID: this.threadID}, true);
		if (curIndex == value - 1)
			throw new Error("Bạn không thể chọn bản thân được!");
	}
	// <-- commit checker

	async onNightEnd(api, code, value) {

	}

	async onNight(api) {
		return [];
	}

	async die(api) {
		this.died = true;
	}
};
