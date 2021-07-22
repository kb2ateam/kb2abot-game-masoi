const fs = require('fs');
const path = require('path');
const deepExtend = require('deep-extend');
let gameConfig;
const cfgPath = path.join(__dirname, 'gameConfig.js');
const cfgExPath = path.join(__dirname, 'gameConfig.example.js');
if (!fs.existsSync(cfgPath)) {
	fs.writeFileSync(cfgPath, fs.readFileSync(cfgExPath));
} else {
	gameConfig = deepExtend(require(cfgExPath), require(cfgPath));
}
const roles = loader(path.join(__dirname, 'roles'));
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

module.exports = class MasoiGame extends kb2abot.schemas.Game {
	constructor(options = {}) {
		super({
			...options,
			...{
				name: 'Ma Sói'
			}
		});
		if (!this.isGroup) {
			throw new Error('Không thể tạo game masoi trong tin nhắn riêng tư!');
		}
		this.amount = parseInt(options.param);
		if (isNaN(this.amount)) {
			throw new Error(
				'Vui lòng nhập đúng định dạng /game masoi <số lượng người chơi>'
			);
		}
		if (!gameConfig.setup[this.amount])
			throw new Error(
				'Không tìm thấy setup với số lượng người chơi ' + this.amount
			);
		this.setup = gameConfig.setup[this.amount];
		this.state = new kb2abot.helpers.State(['settingUp', 'done']);
		this.playerManager = new kb2abot.helpers.Manager();
		this.history = [];
		this.forceEnd = false;
		this.sentInstruction = false;
		this.tannerwin = false;
	}

	async clean() {
		await super.clean();
		this.forceEnd = true;
		for (const player of this.playerManager.items) {
			player.commit(null);
		}
	}

	// ---------------------------------------------------------------------------

	async onMessage(message, reply) {
		if (!this.participants.includes(message.senderID) && this.state.is('done'))
			return;
		await super.onMessage(message, reply);

		if (message.body.toLowerCase() == 'end!') {
			if (message.senderID == this.masterID) {
				await kb2abot.gameManager.clean(this.threadID);
				await reply('Đã dọn dẹp trò chơi');
			} else {
				await reply('Chỉ có chủ tạo game mới có thể end!');
			}
		}

		const curState = 'state_' + this.state.getCurrent();
		if (this[curState].constructor.name == 'AsyncFunction')
			await this[curState](message, reply);
		else this[curState](message, reply);
	}

	// ---------------------------------------------------------------------------

	// --> chat utilities
	chat_playerList(filter = {}) {
		let text = '';
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
				text +=
					`${gameConfig.symbols[index + 1]} ${player.name} ` + `${player.died ? ' - DEAD💀' : ''}\n`;
		}
		return text;
	}

	chat_des(type) {
		const roleData = gameConfig.data[type];
		return (
			`✅ BẠN LÀ ${type.toUpperCase()}!\n` +
			`❓ ${roleData.description}\n` +
			`⚠️ ${roleData.note}` 
			// // `Lời khuyên: ${roleData.advice}\n`+
			// '📍ĐANG GỌI ROLE THEO THỨ TỰ\n'+
			// '🔜VUI LÒNG ĐỢI...'
		);
	}

	async chat_sendStatus(threadID = this.threadID) {
		await this.sendMessage(
			`Còn sống 😚\n${this.chat_playerList({died: false})}`,
			threadID
		);
	}
	// <-- chat utilities

	// ---------------------------------------------------------------------------

	//  --> state function
	async state_settingUp(message) {
		// if (!this.sentInstruction) {
		// 	this.sentInstruction = true;
		// 	// await this.sendMessage(
		// 	// 	'Nhắn "meplay" để vào game \n Nếu muốn kết thúc game thì nhắn "end!"'
		// 	// );
		// 	await this.sendMessage('Số người sẵn sàng: 1/' + this.amount);
		// }
		if (
			message.body.toLowerCase() == 'readyne' &&
			this.participants.length < this.amount &&
			this.u_addParticipant(message.senderID)
		) {
			if (this.participants.length == this.amount) {
				this.state.next();
				const infos = await kb2abot.helpers.fca.getUserInfo(this.participants);
				shuffle(this.setup);
				await asyncWait(2000);
				for (let i = 0; i < this.participants.length; i++) {
					const participantID = this.participants[i];
					const info = infos[participantID];
					const player = this.playerManager.add(
						new roles[this.setup[i]]({
							game: this,
							name: info.name || '<chưa add fr>',
							username:
								kb2abot.helpers.fca.getUsername(info.profileUrl) ||
								'<chưa add fr>',
							threadID: participantID,
							gameID: this.id
						})
					);
					this.sendMessage(this.chat_des(player.type), player.threadID);
					await asyncWait(2000);
				}
				
				
				
				const wws = this.playerManager.items.filter(e => e.type == 'SoiThuong' || e.type == 'SoiTienTri');
				let names = [];
				for (const ww of wws) {
					const {name, type} = ww;
					names.push(`${name}(${type})`);
				}
				await asyncWait(1000);
				for (const ww of wws) {
					const {name,type} = ww;
					// await this.sendMessage('Bạn ở phe Sói🐺', ww.threadID);
					if (names.length > 1)
						await this.sendMessage(
							`Cùng phe Sói🐺 ${names
								.filter(n => n != name)
								.join(
									',  '
								)}\n👋 Hãy liên hệ với họ để teamwork tốt nhé!`,
							ww.threadID
						);
						await asyncWait(1500);
				}
				
				
				const nns = this.playerManager.items.filter(e => e.type == 'SoiThuong' || e.type == 'SoiTienTri' || e.type == 'Minion');
				let namem = [];
				for (const nn of nns) {
					const {name, type} = nn;
					namem.push(`${name}(${type})`);
				}
				await asyncWait(1500);
				const mms = this.playerManager.items.filter(e => e.type == 'Minion');
				for (const mm of mms) {
					const {name,type} = mm;
					// await this.sendMessage('Bạn ở phe Sói🐺', mm.threadID);
					if (namem.length > 1)
						await this.sendMessage(
							`Cùng phe Sói🐺 ${namem
								.filter(n => n != name)
								.join(
									',  '
								)}\n❗️❗️CÁC MINION KHÔNG ĐƯỢC CHO SÓI BIẾT MÌNH LÀ MINION NHÉ❗️❗️`,
							mm.threadID
						);
						await asyncWait(2000);
				}
				


				let balanceScore = 0;
				for (const role of this.setup) {
					balanceScore += gameConfig.data[role].score;
				}
				// await this.sendMessage('Điểm cân bằng: ' + balanceScore);
				await asyncWait(2000);
				// //await this.sendMessage(
				// 	'🎯 Role: \n' +
				// 		gameConfig.arrange.filter(r => this.setup.includes(r)).join(' 👉 ')
				// );
				await asyncWait(2000);
				await this.u_timingSend({
					message: '🎯 Role: \n' +
					gameConfig.arrange.filter(r => this.setup.includes(r)).join(' 👉 ')+  '\n' + '🎯 BẮT ĐẦU SAU',
					timing: gameConfig.timeout.DELAY_STARTGAME,
					left: false
				});
				// await this.sendMessage(
				// 	'Danh sách lệnh (không cần prefix):\n===GROUP===\n1."help": Xem role của mình!\n2."status": Tình trạng các người chơi còn sống\n===PRIVATE===\n1."pass": Bỏ qua lượt'
				// );
				await asyncWait(gameConfig.timeout.DELAY_STARTGAME);
				this.start(message);
			} else {
				await asyncWait(1000);
				await this.sendMessage(`🎮 ${this.participants.length}/${this.amount}`);
				await asyncWait(1000);
			}
		}
	}

	async state_done(message, reply) {
		if (message.body.toLowerCase() != 'end!') {
			const player = this.playerManager.find({threadID: message.senderID});
			switch (message.body.toLowerCase()) {
			case 'help':
				await this.sendMessage(this.chat_des(player.type), message.senderID);
				break;
			case 'status':
				await asyncWait(1000);
				await this.chat_sendStatus(message.threadID);
				break;
			}
			if (!message.isGroup)
				this.playerManager
					.find({threadID: message.senderID})
					.onMessage(message, reply);
		}
	}
	// <-- state function

	// ---------------------------------------------------------------------------

	// --> core
	async start() {
		const task = new kb2abot.helpers.State(['onNight', 'onMorning', 'onVote']);
		while (!this.u_isEnd() && !this.forceEnd) {
			await this[task.getCurrent()]();
			if (task.isEnd()) {
				task.reset();
			} else {
				task.next();
			}
		}
		await asyncWait(1000);
		// await this.sendMessage('Trò chơi kết thúc!');
		//await this.sendMessage(
		//	`🔶 Phe ${this.u_getWinner(true)} thắng!! 🔶`
		//);
		
		// await this.sendMessage(
		// 	'Như chúng ta đã biết, vai trò của từng người là: . . .'
		// );
		let message = '';
		for (const player of this.playerManager.items) {
			const {name, username, type} = player;
			message += `🎭 ${name} - ${type}\n`;
		}
		await asyncWait(1000);
		await this.sendMessage(
			`🔶 Phe ${this.u_getWinner(true)} thắng!! 🔶\n` + '--------------------\n' + message 
			);
		await kb2abot.gameManager.clean(this.threadID);
		// await this.sendMessage('Đã dọn dẹp trò chơi!');
	}

	async onNight() {
		const historyPart = {
			time: 'night',
			movements: []
		};
		this.history.push(historyPart);
		await asyncWait(2500);
		for (const type of gameConfig.arrange) {
			const groupPromise = [];
			const callPromiseQueueIndex = []; // thu tu call index player trong groupPromise
			for (let i = 0; i < this.playerManager.getLength(); i++) {
				const player = this.playerManager.items[i];
				if (player.type == type && !player.died) {
					callPromiseQueueIndex.push(i);
					groupPromise.push(player.onNight());
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

	async onMorning() {
		const movements = this.history_last().movements;

		let iPlayerKilledByWolf = this.u_getIPlayerKilledByWolf(movements),
			iPlayerKilledByWitch = -1;

		if (iPlayerKilledByWolf != -1) {
			for (const movement of this.u_getMovements('BaoVe', movements)) {
				const commit = movement.data[0];
				if (commit.value == null) continue;
				if (commit.value - 1 == iPlayerKilledByWolf) iPlayerKilledByWolf = -1;
			}
		}

		for (const movement of this.u_getMovements('PhuThuy', movements)) {
			for (const commit of movement.data) {
				if (commit.value == null) continue;
				switch (commit.code) {
				case gameConfig.code.PHUTHUY_CUU:
					if (commit.value == '1') iPlayerKilledByWolf = -1;
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
				await player.onNightEnd(commit.code, commit.value);
			}
		}
		
		// await this.sendMessage('Trời sáng ☀️☀️☀️');
		
		let deadAmount = 0;

		if (iPlayerKilledByWolf != -1) {
			deadAmount++;
			const player = this.playerManager.items[iPlayerKilledByWolf];
			const {name, username} = player;
			await asyncWait(2000);
			await this.sendMessage(
				`☀️ ${name} đã ${
					lmao[random(0, lmao.length - 1)]
				} `
			);
			
			//  await this.sendMessage(`Testing: ${this.tannerwin} `);
			
			await player.die('SoiThuong');
		}
		

		if (iPlayerKilledByWitch != -1) {
			deadAmount++;
			const player = this.playerManager.items[iPlayerKilledByWitch];
			const {name, username} = player;
			await asyncWait(1000);
			await this.sendMessage(
				`☀️ ${deadAmount > 1 ? '' : ''}${name} đã ${
					lmao[random(0, lmao.length - 1)]
				} `
			);
			
			await player.die('PhuThuy');
		}
		

		if (deadAmount > 0) {
			// await this.sendMessage(
			// 	`Vậy là đêm qua đã có ${gameConfig.symbols[deadAmount]} người chết!`
			// );
			await asyncWait(1500);
			await this.chat_sendStatus();
			
		} else {
			await asyncWait(1500);
			await this.sendMessage('☀️ Không ai chết hôm nay!');
			
		}
	}
	
	async onVote() {
		await asyncWait(2000);
		await this.u_timingSend({
			message: '☀️ Bắt đầu thảo luận !',
			timing: gameConfig.timeout.DISCUSS
		});
		await asyncWait(gameConfig.timeout.DISCUSS);
		await this.u_timingSend({
			message: '🆘🆘🆘 Hết giờ 🆘🆘🆘\n⚠️ Check tin nhắn riêng !',
			timing: gameConfig.timeout.VOTEKILL,
			left: false
		});
		await asyncWait(2000);

		const groupPromises = [];
		for (const player of this.playerManager.items) {
			if (!player.died) groupPromises.push(player.voteKill());
			await asyncWait(2000);
		}

		const votes = await Promise.all(groupPromises);
		const voteChart = [];
		for (const commit of votes) {
			if (!commit.value) continue;
			const index = voteChart.findIndex(e => e.index == commit.value - 1);
			if (index != -1) {
				voteChart[index].amount++;
			} else {
				if (!commit.value) continue;
				voteChart.push({
					index: commit.value - 1,
					amount: 1
				});
			}
		}
		
		if (voteChart.length == 0) {
			await asyncWait(1500);
			await this.sendMessage('🔥 Không ai bị treo cổ !\n🌙 Màn đêm buông xuống 🌙\n ❌ TIẾP TỤC LÀM TASK ❌ ');
			return;
		}
		voteChart.sort((a, b) => b.amount - a.amount);

		let voteResult = 'Kết quả vote 🔥 \n';
		for (let i = 0; i < voteChart.length; i++) {
			const vote = voteChart[i];
			const {name, username} = this.playerManager.items[vote.index];
			voteResult += `${gameConfig.symbols[i + 1]} ${name}:  ${
				vote.amount
			}${
				i == 0 && (voteChart.length == 1 || voteChart[1].amount < vote.amount)
					? ' 💔🤬'
					: ''
			}\n`;
		}
		await asyncWait(1500);
		await this.sendMessage(voteResult);
		await asyncWait(1500);

		

		if (voteChart.length > 1 && voteChart[0].amount == voteChart[1].amount) {
			await asyncWait(1500);
			await this.sendMessage('🔥 Không ai bị treo cổ !(huề)\n🌙 Màn đêm buông xuống 🌙\n ❌ TIẾP TỤC LÀM TASK ❌ ');
			await asyncWait(1500);
		} else {
			const {index: hangedIndex, amount} = voteChart[0];
			const percent = amount / votes.length;
			const player = this.playerManager.items[hangedIndex];
			const {name, username, type} = player;
			
			if (percent >= 0.5) {
				// await this.sendMessage(`Treo cổ ${name}(${username}) ...`);
				if(this.playerManager.items[hangedIndex].type == 'ChanDoi'){
					this.tannerwin = true;
					// await this.sendMessage(`Tanner checking: ${this.tannerwin} !\nBugs about this role please contact Andrei!`);
				}
				

				
				await player.die();
				await asyncWait(1500);
				await this.sendMessage(
					`Treo cổ... 🥵\n☀️ ${name} đã ${
						lmao[random(0, lmao.length - 1)]
					} \n🌙 Màn đêm buông xuống 🌙\n ❌ TIẾP TỤC LÀM TASK ❌ `
				);	
				await asyncWait(1500);
				await this.chat_sendStatus();
				await asyncWait(1500);
			} else {
			
				const need = Math.ceil(votes.length / 2) - amount;
				await asyncWait(1500);
				await this.sendMessage(
					`⛔️ Không đủ vote cho ${name}\n(hiện tại: ${amount}, cần thêm: ${need} phiếu!)\n🌙 Màn đêm buông xuống 🌙\n ❌ TIẾP TỤC LÀM TASK ❌ `
				);
				await asyncWait(1500);
			}
		}
	}
	// <-- core

	// ---------------------------------------------------------------------------

	// --> game utilities

	async sendMessage(message, threadID = this.threadID) {
		await kb2abot.helpers.fca.sendMessage(message, threadID);
	}

	async u_timingSend({
		message = '',
		timing = 0,
		threadID = this.threadID,
		left = true
	} = {}) {
		if (timing < 0) timing = 0;
		const hh = Math.floor(timing / 1000 / 60 / 60);
		const mm = Math.floor((timing - hh * 60 * 60 * 1000) / 1000 / 60);
		const ss = Math.ceil(
			(timing - hh * 60 * 60 * 1000 - mm * 60 * 1000) / 1000
		);
		let text = `${ss}s`;
		if (mm > 0) text = `${mm}m ${text}`;
		if (hh > 0) text = `${hh}h ${text}`;
		if (left) await this.sendMessage(`[${text}] ${message}`, threadID);
		else await this.sendMessage(`${message} [${text}]`, threadID);
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
		for (const movement of this.u_getMovements('SoiThuong', movements)) {
			const commit = movement.data[0];
			if (commit.value == null) continue;
			dd[commit.value]++;
			if (max < dd[commit.value]) {
				iPlayerKilledByWolf = commit.value - 1;
				max = dd[commit.value];
			}
		}
		const sorted = [...dd].sort((a, b) => b - a);
		if (sorted[0] == sorted[1]) iPlayerKilledByWolf = -1;
		return iPlayerKilledByWolf;
	}

	u_getDeaths() {
		const out = [];
		for (const player of this.playerManager.items) {
			if (player.died) out.push(player);
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
		if(this.tannerwin == true){
			return text? 'Chan Doi 🤠' : 1;
		} else {
		let wwCount = 0;
		let danlangCount = 0;
		// let tannerCount = 0;
		// if(this.tannerwin = true){
		// 		tannerCount += 100;
		// } 
		for (const player of this.playerManager.items) {
			const {party} = gameConfig.data[player.type];
			if (player.died) continue;
			if (party == -1) wwCount++;
			if (party == 1) danlangCount++;
		
	}

		// if (tannerCount > 50) return text ? 'Testing' : 2;
		if (danlangCount <= wwCount) return text ? '🐺' : -1;
		if (wwCount <= 0) return text ? '👦🏻' : 1;
		return null;}
	}


	u_addParticipant(id) {
		if (this.participants.includes(id)) return false;
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
