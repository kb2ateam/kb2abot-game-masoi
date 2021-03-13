const fs = require("fs");
const path = require("path");
const cfgPath = path.join(__dirname, "gameConfig.js");
const cfgExPath = path.join(__dirname, "gameConfig.example.js");
if (!fs.existsSync(cfgPath)) {
	fs.writeFileSync(cfgPath, fs.readFileSync(cfgExPath));
}
let gameConfig = require("./gameConfig");
const roles = loader.load(path.join(__dirname, "roles"));
const {sendMessage} = kb2abot.helpers.fca;
const {asyncWait, random, shuffle} = kb2abot.helpers;
const lmao = ["ngủm", "chết", "tắt thở", "ra đi", "ngỏm củ tỏi", "bị bruh", "dead", "lmao", "về với ông bà", "lên thiên đàng"];

module.exports = class MasoiGame extends kb2abot.schemas.Game {
	constructor(options = {}) {
		super({
			...options,
			...{
				name: "Ma Sói"
			},
		});
		if (!this.isGroup) {
			throw new Error("Không thể tạo game masoi trong tin nhắn riêng tư!");
		}
		this.amount = parseInt(options.param);
		if (isNaN(this.amount)) {
			throw new Error("Vui lòng nhập đúng định dạng /game masoi <số lượng người chơi>");
		}
		if (!gameConfig.setup[this.amount])
			throw new Error("Không tìm thấy setup với số lượng người chơi " + this.amount);
		this.setup = gameConfig.setup[this.amount];
		this.state = new kb2abot.helpers.State([
			"settingUp",
			"done"
		]);
		this.playerManager = new kb2abot.helpers.Manager();
		this.history = [];
		this.forceEnd = false;
		this.sentInstruction = false;
	}

	async clean() {
		await super.clean();
		this.forceEnd = true;
		for (const player of this.playerManager.items) {
			player.commit(null);
		}
	}

	// ---------------------------------------------------------------------------

	async onMessage(api, message) {
		if (!this.participants.includes(message.senderID) && this.state.is("done"))
			return;
		await super.onMessage(api, message);

		if (message.body.toLowerCase() == "end!") {
			if (message.senderID == this.masterID) {
				await kb2abot.gameManager.clean(this.threadID);
				await this.sendMessage(api, "Đã dọn dẹp trò chơi");
			}	else {
				await this.sendMessage(api, "Chỉ có chủ tạo game mới có thể end!");
			}
		}

		const curState = "state_" + this.state.getCurrent();
		if (this[curState].constructor.name == "AsyncFunction")
			await this[curState](api, message);
		else
			this[curState](api, message);
	}

	// ---------------------------------------------------------------------------

	// --> chat utilities
	chat_playerList(filter = {}) {
		let text = "";
		for (let index = 0; index < this.playerManager.getLength(); index++) {
			const player = this.playerManager.items[index];

			let pass = true;
			for (const key in filter) {
				if (player[key] !== filter[key]) {
					pass = false;
					break;
				}
			}

			if (pass)
				text += `${gameConfig.symbols[index+1]} ${player.name} (${player.username})`+
								`${player.died ? " - đã chết" : ""}\n`;
		}
		return text;
	}

	chat_des(type) {
		const roleData = gameConfig.data[type];
		return `BẠN LÀ ${type.toUpperCase()}!\n` +
					 `Chức năng: ${roleData.effect}\n` +
					 `Mô tả: ${roleData.description}\n` +
					 `Lưu ý: ${roleData.note}\n` +
					 `Lời khuyên: ${roleData.advice}`;
	}

	async chat_sendStatus(api, threadID = this.threadID) {
		await sendMessage(api, `Tình trạng:\n${this.chat_playerList()}`, threadID);
	}
	// <-- chat utilities

	// ---------------------------------------------------------------------------

	//  --> state function
	async state_settingUp(api, message) {
		if (message.body.toLowerCase() == "meplay" && this.participants.length < this.amount && this.u_addParticipant(message.senderID)) {
			await this.sendMessage(api, `Tình trạng: ${this.participants.length}/${this.amount}!`);
			if (this.participants.length == this.amount) {
				const infos = await kb2abot.helpers.fca.getUserInfo(api, this.participants);
				shuffle(this.setup);
				for (let i = 0; i < this.participants.length; i++) {
					const participantID = this.participants[i];
					const info = infos[participantID];
					this.playerManager.add(new roles[this.setup[i]]({
						name: info.name || "(chưa kb)",
						username: kb2abot.helpers.fca.getUsername(info.profileUrl) || "(chưa kb)",
						threadID: participantID,
						gameID: this.id
					}));
				}
				const wws = this.playerManager.items.filter(e => e.type == "SoiThuong");
				let names = [];
				for (const ww of wws) {
					const {name, username} = ww;
					names.push(`${name}(${username})`);
				}
				for (const ww of wws) {
					const {name} = ww;
					await sendMessage(api, "Bạn ở phe /Sói/", ww.threadID);
					await sendMessage(api, `Những người cùng phe với bạn là: ${names.filter(n => n!=name).join(", ")}\n Hãy liên hệ với họ để có 1 teamwork tốt nhất nhé!`, ww.threadID);
				}
				let balanceScore = 0;
				for (const role of this.setup) {
					balanceScore += gameConfig.data[role].score;
				}
				await this.sendMessage(api, "Điểm cân bằng: " + balanceScore);
				await this.sendMessage(api, "Thứ tự gọi: " + gameConfig.arrange.filter(r => this.setup.includes(r)).join(" 👉 "));
				await this.u_timingSend({
					api,
					message: "Trò chơi bắt đầu sau",
					timing: gameConfig.timeout.DELAY_STARTGAME,
					left: false
				});
				await this.sendMessage(api, "Danh sách lệnh (nhắn vô group này hoặc vô bot): \n1.\"help\": xem role của mình!\n2.\"status\": Tình trạng các người chơi");
				await asyncWait(gameConfig.timeout.DELAY_STARTGAME);
				this.start(api, message);
				this.state.next();
			}
		}
		if (!this.sentInstruction) {
			await this.sendMessage(api, "Nhắn \"meplay\" để vào game (chủ game không cần nhắn)\n Nếu muốn end game ngay lập tức thì nhắn \"end!\"");
			await this.sendMessage(api, "số người sẵn sàng: 1/"+this.amount);
			this.sentInstruction = true;
		}
	}

	async state_done(api, message) {
		if (message.body != "end!") {
			const player = this.playerManager.find({threadID: message.senderID});
			switch(message.body) {
			case "help":
				await sendMessage(api, this.chat_des(player.type), message.senderID);
				break;
			case "status":
				await this.chat_sendStatus(api, message.threadID);
				break;
			}
			if (!message.isGroup)
				this.playerManager.find({threadID: message.senderID}).onMessage(api, message);
		}
	}
	// <-- state function

	// ---------------------------------------------------------------------------

	// --> core
	async start(api) {
		const task = new kb2abot.helpers.State(["onNight", "onMorning", "onVote"]);
		while (!this.u_isEnd() && !this.forceEnd) {
			await this[task.getCurrent()](api);
			if (task.isEnd()) {
				task.reset();
			} else {
				task.next();
			}
		}
		await this.sendMessage(api, "Trò chơi kết thúc!");
		await this.sendMessage(api, `Phe /${this.u_getWinner(true)}/ đã giành chiến thắng!!`);
		await this.sendMessage(api, "Như chúng ta đã biết, vai trò của từng người là: . . .");
		let message = "";
		for (const player of this.playerManager.items) {
			const {name, username, type} = player;
			message += `${name}(${username}) - ${type}\n`;
		}
		await asyncWait(2000);
		await this.sendMessage(api, message);
		await kb2abot.gameManager.clean(this.threadID);
		await this.sendMessage(api, "Đã dọn dẹp trò chơi!");
	}

	async onNight(api) {
		const historyPart = {
			time: "night",
			movements: []
		};
		this.history.push(historyPart);
		for (const type of gameConfig.arrange) {
			const groupPromise = [];
			const callPromiseQueueIndex = []; // thu tu call index player trong groupPromise
			for (let i = 0; i < this.playerManager.getLength(); i++) {
				const player = this.playerManager.items[i];
				if (player.type == type && !player.died) {
					callPromiseQueueIndex.push(i);
					groupPromise.push(player.onNight(api));
				}
			}
			if (groupPromise.length > 0) {
				const res = await Promise.all(groupPromise);
				for (let i = 0; i < callPromiseQueueIndex.length; i++) {
					const indexPlayer = callPromiseQueueIndex[i];
					const player = this.playerManager.items[indexPlayer];
					historyPart.movements.push({
						indexPlayer,
						type: player.type,
						data: res[i]
					});
				}
			}
		}
	}

	async onMorning(api) {
		const movements = this.history_last().movements;

		let
			iPlayerKilledByWolf = this.u_getIPlayerKilledByWolf(movements),
			iPlayerKilledByWitch = -1;

		if (iPlayerKilledByWolf != -1) {
			for (const movement of this.u_getMovements("BaoVe", movements)) {
				const commit = movement.data[0];
				if (commit.value == null)
					continue;
				if (commit.value - 1 == iPlayerKilledByWolf)
					iPlayerKilledByWolf = -1;
			}
		}

		for (const movement of this.u_getMovements("PhuThuy", movements)) {
			for (const commit of movement.data) {
				if (commit.value == null)
					continue;
				switch(commit.code) {
				case gameConfig.code.PHUTHUY_CUU:
					if (commit.value == "1")
						iPlayerKilledByWolf = -1;
					break;
				case gameConfig.code.PHUTHUY_GIET:
					iPlayerKilledByWitch = commit.value - 1;
					if (iPlayerKilledByWitch == iPlayerKilledByWolf)
						iPlayerKilledByWolf = -1;
					break;
				}
			}
		}

		// night end, starting morning
		for (const movement of movements) {
			const player = this.playerManager.items[movement.indexPlayer];
			for (const commit of movement.data) {
				await player.onNightEnd(api, commit.code, commit.value);
			}
		}
		await this.sendMessage(api, "Trời đã sáng!!");

		let deadAmount = 0;

		if (iPlayerKilledByWolf != -1) {
			deadAmount++;
			const player = this.playerManager.items[iPlayerKilledByWolf];
			const {name, username} = player;
			await this.sendMessage(api, `Người chơi ${name}(${username}) đã ${lmao[random(0, lmao.length-1)]} 💀`);
			await asyncWait(2000);
			await this.sendMessage(api, "*trên thi thể có rất nhiều vết cắn!");
			await asyncWait(2000);
			await player.die(api, "SoiThuong");
		}

		if (iPlayerKilledByWitch != -1) {
			deadAmount++;
			const player = this.playerManager.items[iPlayerKilledByWitch];
			const {name, username} = player;
			await this.sendMessage(
				api,
				`${(deadAmount>1?"PHÁT HIỆN THÊM n":"N")}gười chơi ${name}(${username}) đã ${lmao[random(0, lmao.length-1)]} 💀`
			);
			await asyncWait(2000);
			await player.die(api, "PhuThuy");
		}

		if (deadAmount > 0) {
			await this.sendMessage(api, `Vậy là đêm qua đã có ${gameConfig.symbols[deadAmount]} người chết!`);
			await this.chat_sendStatus(api);
		} else {
			await this.sendMessage(api, "Một đêm bình yên và không có chết chóc!");
		}
	}

	async onVote(api) {
		await this.u_timingSend({
			api,
			message: "Giây phút bình loạn bắt đầu!!",
			timing: gameConfig.timeout.DISCUSS
		});
		await asyncWait(gameConfig.timeout.DISCUSS);
		await this.u_timingSend({
			api,
			message: "Đã hết giờ bình loạn, các bạn muốn treo cổ ai?",
			timing: gameConfig.timeout.VOTEKILL,
			left: false
		});

		const groupPromises = [];
		for (const player of this.playerManager.items) {
			if (!player.died)
				groupPromises.push(player.voteKill(api));
		}

		const votes = await Promise.all(groupPromises);
		const voteChart = [];
		for (const commit of votes) {
			if (!commit.value) continue;
			const index = voteChart.findIndex(e => e.index == commit.value - 1);
			if (index != -1) {
				voteChart[index].amount++;
			} else {
				voteChart.push({
					index: commit.value - 1,
					amount: 1
				});
			}
		}
		voteChart.sort((a, b) => b-a);

		let voteResult = "Kết quả vote: \n";
		for (let i = 0; i < voteChart.length; i++) {
			const result = voteChart[i];
			const {name, username} = this.playerManager.items[result.index];
			voteResult += `${gameConfig.symbols[i+1]} ${name}(${username}): ${result.amount}${i==0 && voteChart[1].amount<result.amount?"💔💦":""}\n`;
		}
		await this.sendMessage(api, voteResult);

		if (voteChart[0].amount == voteChart[1].amount) {
			await this.sendMessage(api, "Sẽ không có ai bị treo cổ trong hôm nay (huề)");
		} else {
			const {index: hangedIndex, amount} = voteChart[0];
			const percent = amount / votes.length;
			const player = this.playerManager.items[hangedIndex];
			const {name, username} = player;
			if (percent >= 0.5) {
				await this.sendMessage(api, `Treo cổ ${name}(${username}) ...`);
				await asyncWait(2000);
				await player.die(api);
				await this.sendMessage(api, `Người chơi ${name}(${username}) đã ${lmao[random(0, lmao.length-1)]} 💀`);
				await asyncWait(1000);
				await this.chat_sendStatus(api);
			} else {
				const need = Math.ceil(votes.length/2) - amount;
				await this.sendMessage(api, `Không đủ số lượng vote cho ${name}(${username}) (hiện tại: ${amount}, cần thêm: ${need} phiếu!)`);
			}

		}
	}
	// <-- core

	// ---------------------------------------------------------------------------

	// --> game utilities

	async sendMessage(api, message) {
		await sendMessage(api, message, this.threadID);
	}

	async u_timingSend({
		api,
		message = "",
		timing = 0,
		threadID = this.threadID,
		left = true
	} = {}) {
		if (timing < 0)
			timing = 0;
		const hh = Math.floor(timing / 1000 / 60 / 60);
		const mm = Math.floor((timing - hh * 60 * 60 * 1000) / 1000 / 60);
		const ss = Math.ceil((timing - hh * 60 * 60 * 1000 - mm * 60 * 1000) / 1000);
		let text = `${ss}s`;
		if (mm > 0)
			text = `${mm}m ${text}`;
		if (hh > 0)
			text = `${hh}h ${text}`;
		if (left)
			await sendMessage(api, `[${text}] ${message}`, threadID);
		else
			await sendMessage(api, `${message} [${text}]`, threadID);
		return {
			hh,
			mm,
			ss
		};
	}

	u_getIPlayerKilledByWolf(movements) {
		let iPlayerKilledByWolf = -1;
		let max = -1;
		const dd = new Array(this.playerManager.getLength() + 1).fill(0);
		for (const movement of this.u_getMovements("SoiThuong", movements)) {
			const commit = movement.data[0];
			if (commit.value == null)
				continue;
			dd[commit.value]++;
			if (max < dd[commit.value]) {
				iPlayerKilledByWolf = commit.value - 1;
				max = dd[commit.value];
			}
		}
		const sorted = [...dd].sort((a,b) => b-a);
		if (sorted[0] == sorted[1])
			iPlayerKilledByWolf = -1;
		return iPlayerKilledByWolf;
	}

	u_getDeaths() {
		const out = [];
		for (const player of this.playerManager.items) {
			if (player.died)
				out.push(player);
		}
		return out;
	}

	u_getMovements(type, movements) {
		const out = [];
		for (const movement of movements) {
			if (this.playerManager.items[movement.indexPlayer].type == type)
				out.push(movement);
		}
		return out;
	}

	u_isEnd() {
		if (!this.u_getWinner())
			return false;
		return true;
	}

	u_getWinner(text = false) {
		let wwCount = 0;
		let danlangCount = 0;
		for (const player of this.playerManager.items) {
			const {party} = gameConfig.data[player.type];
			if (player.died) continue;
			if (party == -1)
				wwCount++;
			if (party == 1)
				danlangCount++;
		}
		if (danlangCount <= wwCount)
			return text ? "Sói" : -1;
		if (wwCount <= 0)
			return text ? "Dân Làng" : 1;
		return null;
	}

	u_addParticipant(id) {
		if (this.participants.includes(id))
			return false;
		this.participants.push(id);
		return true;
	}
	// <-- game utilities

	// ---------------------------------------------------------------------------

	// --> history
	history_addTime(time) {
		this.history.push({
			time,
			movements: []
		});
		return this.history_last();
	}
	history_addMovement(type, data) {
		this.history[this.history.length - 1].movements.push({
			type,
			data
		});
	}
	history_last() {
		return this.history[this.history.length - 1];
	}
	// <-- history
};
