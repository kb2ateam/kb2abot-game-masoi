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

const lmaojoin = [
	' ❤️ ',
	' 🧡 ',
	' 💛 ',
	' 💚 ',
	' 💜 ',
	' 💙 ',
	' 🖤 ',
	' 💖 ',
	' 💝 ',
	' 💘 '
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
				'Vui lòng nhập đúng định dạng /game masoi <số lượng người chơi> <bảng role(1 hoặc 2)>'
			);
		}
		this.setrole = parseInt(options.paramset);
		if (isNaN(this.setrole) || (this.setrole > 2) || (this.setrole < 1)) {
			throw new Error(
				`Vui lòng nhập đúng định dạng /game masoi <số lượng người chơi> <bảng role(1 hoặc 2)>`
			);
		}
		if (!gameConfig.setup[this.amount])
			throw new Error(
				'Không tìm thấy setup với số lượng người chơi ' + this.amount
			);
		if (!gameConfig.setup2[this.amount])
		throw new Error(
			'Không tìm thấy setup với số lượng người chơi ' + this.amount
		);
		if (this.setrole == 1){
			this.setup = gameConfig.setup[this.amount];}
		else if(this.setrole == 2){
		this.setup = gameConfig.setup2[this.amount];	
	}
		this.state = new kb2abot.helpers.State(['settingUp', 'done']);
		this.playerManager = new kb2abot.helpers.Manager();
		this.history = [];
		this.forceEnd = false;
		this.sentInstruction = false;
		this.tannerwin = false;
		this.couplewin = false;
		this.iPlayerKilledByVampire = -1;
		this.vampirewin = false;
		this.minionwin = false;
		this.firstindex = -1;
		this.secondindex = -1;
		this.pairs = [];
		this.parischeck = [];
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
				await asyncWait(2000);
				await kb2abot.gameManager.clean(this.threadID);
				await reply('Đã dọn dẹp trò chơi');
			} else {
				await asyncWait(1000);
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
					`${gameConfig.symbols[index + 1]} ${player.name} ` + `${player.died ? ' - DEAD 💀' : ''}\n`;
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
	async chat_sendStatusDead(threadID = this.threadID) {
		await this.sendMessage(
			`Đã chết 💀\n${this.chat_playerList({died: true})}`,
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
			message.body.toLowerCase() == 'lecailonlen' &&
			this.participants.length < this.amount &&
			this.u_addParticipant(message.senderID)
		) {
			if (this.participants.length == this.amount) {
				this.state.next();
				await asyncWait(1000);
				const infos = await kb2abot.helpers.fca.getUserInfo(this.participants);
				shuffle(this.setup);
				for (let i = 0; i < this.participants.length; i++) {
					await asyncWait(1000);
					const participantID = this.participants[i];
					await asyncWait(1000);
					const info = infos[participantID];
					await asyncWait(1000);
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
					await asyncWait(2000);
					this.sendMessage(this.chat_des(player.type), player.threadID);
				}
				
				
				
				const wws = this.playerManager.items.filter(e => e.type == 'SoiThuong' || e.type == 'SoiTienTri' || e.type == 'SoiAnChay');
				let names = [];
				for (const ww of wws) {
					const {name, type} = ww;
					names.push(`${name}(${type})`);
				}
				for (const ww of wws) {
					const {name,type} = ww;
					// await this.sendMessage('Bạn ở phe Sói🐺', ww.threadID);
					if (names.length > 1){
						await asyncWait(2000);
						await this.sendMessage(
							`Cùng phe Sói 🐺 ${names
								.filter(n => n != name)
								.join(
									',  '
								)}\n👋 Hãy liên hệ với họ để teamwork tốt nhé!\n❗️❗️SÓI VÀ MINION KHÔNG ĐƯỢC LIÊN LẠC NHAU❗️❗️`,
							ww.threadID
						);
								}
				}
				
				
				const nns = this.playerManager.items.filter(e => e.type == 'SoiThuong' || e.type == 'SoiTienTri' || e.type == 'SoiAnChay' || e.type == 'Minion');
				let namem = [];
				for (const nn of nns) {
					const {name, type} = nn;
					namem.push(`${name}(${type})`);
				}
				const mms = this.playerManager.items.filter(e => e.type == 'Minion');
				for (const mm of mms) {
					const {name,type} = mm;
					// await this.sendMessage('Bạn ở phe Sói🐺', mm.threadID);
					if (namem.length > 1)
						await asyncWait(2000);
						await this.sendMessage(
							`Cùng phe Sói 🐺 ${namem
								.filter(n => n != name)
								.join(
									',  '
								)}\n❗️❗️CÁC MINION KHÔNG ĐƯỢC LIÊN LẠC VÀ CHO SÓI BIẾT MÌNH LÀ MINION NHÉ❗️❗️`,
							mm.threadID
						);
						
				}
				
				const cps = this.playerManager.items.filter(e => e.type == 'Mason');
				let namec = [];
				for (const cp of cps) {
					const {name, type} = cp;
					namec.push(`${name}(${type})`);
				}
				const ccs = this.playerManager.items.filter(e => e.type == 'Mason');
				for (const cc of ccs) {
					const {name,type} = cc;
					// await this.sendMessage('Bạn ở phe Sói🐺', mm.threadID);
					if (namec.length > 1)
						await asyncWait(2000);
						await this.sendMessage(
							`Anh em sinh đôi 🤝 ${namec
								.filter(n => n != name)
								.join(
									',  '
								)}`,
							cc.threadID
						);
						
				}
				


				let balanceScore = 0;
				for (const role of this.setup) {
					balanceScore += gameConfig.data[role].score;
				}
				// await this.sendMessage('Điểm cân bằng: ' + balanceScore);
				
				//await this.sendMessage(
					//'🎯 Role: \n' +
						//gameConfig.arrange.filter(r => this.setup.includes(r)).join(' 👉 ')
				//);
				// await this.u_timingSend({
				// 	message: '🎯 Role: \n' +
				// 		this.setup.join(lmaojoin[random(0, lmao.length - 1)]) + '\n' + '🎯 BẮT ĐẦU SAU',
				// 	timing: gameConfig.timeout.DELAY_STARTGAME,
				// 	left: false
				// });
				await asyncWait(2000);
				await this.u_timingSend({
					message: ` ⚜️  WEREWOLF WORLD  ⚜️\n\n🎯 Bảng Role ${gameConfig.symbols[this.setrole]}\n\n${this.allRole()}\n\n🔰 Thứ tự gọi: \n\n${gameConfig.arrange.filter(r => this.setup.includes(r)).join(' 👉 ')}\n\n🙆‍♂️ PLAYERS LIST 🙆‍♂️\n\n${this.chat_playerList({died: false})}\n\n🎯 BẮT ĐẦU SAU`,
					timing: gameConfig.timeout.DELAY_STARTGAME,
					left: false
				});
				// await this.sendMessage(
				// 	'Danh sách lệnh (không cần prefix):\n===GROUP===\n1."help": Xem role của mình!\n2."status": Tình trạng các người chơi còn sống\n===PRIVATE===\n1."pass": Bỏ qua lượt'
				// );
				await asyncWait(gameConfig.timeout.DELAY_STARTGAME);
				this.start(message);
			} else {
				await asyncWait(2000);
				await this.sendMessage(`🎮 ${this.participants.length}/${this.amount}`);
			}
		}
	}

	async state_done(message, reply) {
		if (message.body.toLowerCase() != 'end!') {
			const player = this.playerManager.find({threadID: message.senderID});
			switch (message.body.toLowerCase()) {
			case 'help':
				await asyncWait(2000);
				await this.sendMessage(this.chat_des(player.type), message.senderID);
				break;
			case 'status':
				await asyncWait(2000);
				await this.chat_sendStatus(message.threadID);
				break;
			case 'deadstatus':
			await asyncWait(2000);
			await this.chat_sendStatusDead(message.threadID);
			break;
			// case 'newbie':
			// 	await asyncWait(3000);
			// 	await this.sendMessage('⚠️ Hãy nhắn tin riêng với tui! Bump Bump Bump!!!');
			// 	break;
			// case 'allrole':
			// 	await asyncWait(3000);
			// 	await this.sendMessage('https://docs.google.com/document/d/19jNoaIJL_kRukeeN2ooOUe6cDe5_GeikqkcCQUX9yHM/edit');
			// 	break;
			// case 'night':
			// 	await asyncWait(3000);
			// 	await this.sendMessage('⚠️ CÓ THẤY ĐÊM RỒI KO MÀ LÌ VẬY ? LÀM TASK ĐI CHỨ NÓI CLG NÓI DỮ DZÃY ? ⚠️');
			// 	break;
			case 'allrole':
				await asyncWait(2000);
				await this.sendMessage(`🎯 Role: \n\n${this.allRole()}\n\n🔰 Thứ tự gọi: \n\n${gameConfig.arrange.filter(r => this.setup.includes(r)).join(' 👉 ')}`);
				break;
			// case 'day':
			// 	await asyncWait(3000);
			// 	await this.sendMessage('⚠️ TỤI BÂY THÍCH IM KHÔNG ? :) CHƠI CHI MÀ IM QUÁ ZAY ? ⚠️');
			// 	break;
			// case 'fukdead':
			// 	await asyncWait(3000);
			// 	await this.sendMessage('⚠️ CÒN LƯU LUYẾN CLG ? CHẾT RỒI MÀ MẮC CLG NÓI QUÀI ZAY ? ⚠️');
			// 	break;
			// case 'calldong':
			// 	var indexdong = -1;
			// 	for(var i = 0, len = this.playerManager.items.length; i < len; i++) {
			// 	if (this.playerManager.items[i].type == "ThayDong" && !this.playerManager.items[i].died ) {
			// 	indexdong = i;
			// 	break;
			// 				}}			
			// 	if (indexdong != -1) {	
			// 		const dongPlayer = this.playerManager.items[indexdong];
			// 		await asyncWait(2000);
			// 		await dongPlayer.sendMessage('⚠️ Đồng ơi inbox làm nhiệm vụ đi chứ làm clg mà vô dụng quá vậy ? ⚠️');
			// 	}
			// 	const cloneSetup = Array.from(this.setup);
			// 	shuffle(cloneSetup);
			// 	var finddong = cloneSetup.filter(function(e, index, arr){
							
			// 		if (e == "ThayDong")
			// 				return e;
			// 	});
			// 	if (finddong.length == 1){
			// 		await asyncWait(2000);
			// 		await this.sendMessage('⚠️ ĐỒNG ƠI INBOX LÀM NHIỆM VỤ ĐI CHỨ LÀM CLG MÀ VÔ DỤNG QUÁ VẬY ? ⚠️');
			// 		break;
			// 	}else{
			// 		await asyncWait(2000);
			// 		await this.sendMessage('⚠️ LÀM GÌ CÓ ĐỒNG MÀ CALL CALL ? CÓ ĐIÊN KHUM ? ⚠️');
			// 		break;
			// 		}
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
		// await this.sendMessage('Trò chơi kết thúc!');
		//await this.sendMessage(
			//`🔶 Phe ${this.u_getWinner(true)} thắng!! 🔶`
		//);
		
		// await this.sendMessage(
		// 	'Như chúng ta đã biết, vai trò của từng người là: . . .'
		// );
		let message = '';
		for (const player of this.playerManager.items) {
			const {name, username, type} = player;
			message += `🎭 ${name} - ${type}\n`;
		}
		await asyncWait(2000);
		await this.sendMessage(`🔶 Phe ${this.u_getWinner(true)} thắng!! 🔶 \n` + '-------------------------\n' + message);
		await kb2abot.gameManager.clean(this.threadID);
		// await this.sendMessage('Đã dọn dẹp trò chơi!');
	}

	async onNight() {
		const historyPart = {
			time: 'night',
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
					await asyncWait(2000);
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
		let iPlayerKilledBySeerWolf = -1;

		let alone = false;
		const arraytri = Array.from(this.playerManager.items);
		const werewolfs = arraytri.filter(
			player => (player.type == "SoiThuong")
		);
		
		const alives = werewolfs.filter(wolves => !wolves.died);

		if ((alives.length <= 0)){
			alone = true;
		}

		for (const movement of this.u_getMovements('Cupid', movements)) {
			for (const commit of movement.data) {
				if (commit.value == null) continue;
				switch (commit.code) {
				case gameConfig.code.CUPIDFIRST:
					this.pairscheck = commit.value
					.split(' ')
					.slice(0, 2);
					this.firstindex = this.pairscheck[0] - 1;
					this.secondindex = this.pairscheck[1] - 1;
					this.pairs.push(this.firstindex);
					this.pairs.push(this.secondindex);
					break;
				// case gameConfig.code.CUPIDSECOND:
				// 	this.secondindex = commit.value - 1;
                // 	this.pairs.push(this.secondindex);
				// 	break;
				}
			}
		}

		// if (this.pairs.length == 2){
		// 	this.sendMessage(`PAIR INDEX: ${this.pairs[0]} AND ${this.pairs[1]}`);
		// }

		if ((alone == true)){
			for (const movement of this.u_getMovements('SoiTienTri', movements)) {
				for (const commit of movement.data) {
					if (commit.value == null) continue;
					switch (commit.code) {
					case gameConfig.code.SOITIENTRI_VOTE:
						iPlayerKilledBySeerWolf = commit.value - 1;
						iPlayerKilledByWolf = iPlayerKilledBySeerWolf;
						break;
					}
				}
		}
			// <----------------------------------->
		// 	for (const movement of this.u_getMovements('SoiTienTri', movements)) {
		// 		for (const commit of movement.data) {
		// 			if (commit.value == null) continue;
		// 			switch (commit.code) {
		// 			case gameConfig.code.SOITIENTRI_VOTE:
		// 				iPlayerKilledBySeerWolf = commit.value - 1;
		// 				if (iPlayerKilledBySeerWolf != -1) iPlayerKilledByWolf = iPlayerKilledBySeerWolf;
		// 				break;
		// 			}
		// 		}
		// }
	}
	if (iPlayerKilledByWolf != -1) {
		const vampirePlayer = this.playerManager.items[iPlayerKilledByWolf];
		if (vampirePlayer.type == "Vampire"){iPlayerKilledByWolf = -1};
	}

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

		if (iPlayerKilledByWolf != -1) {
			const bansoiPlayer = this.playerManager.items[iPlayerKilledByWolf];
			if (bansoiPlayer.type == "BanSoi"){
				iPlayerKilledByWolf = -1;
				bansoiPlayer.type = "SoiThuong";
				//bansoiPlayer.sendMessage("Bạn đã biến thành Sói do bị cắn!");
				const fww = this.playerManager.items.filter(e => e.type == 'SoiThuong' || e.type == 'SoiTienTri' || e.type == 'SoiAnChay');
				let namef = [];
				for (const ww of fww) {
					const {name, type} = ww;
					namef.push(`${name}(${type})`);
				}
				
				
				for (const ww of fww) {
					const {name,type} = ww;
					// await this.sendMessage('Bạn ở phe Sói🐺', ww.threadID);
					if (namef.length > 1)
						await asyncWait(2000);
						await bansoiPlayer.sendMessage(
							`🌗 BẠN BỊ SÓI CẮN NÊN ĐÃ BIẾN THÀNH SÓI!\nCùng phe Sói 🐺 ${namef
								.filter(n => n != name)
								.join(
									',  '
								)}\n👋 Hãy liên hệ với họ để teamwork tốt nhé!\n❗️❗️SÓI VÀ MINION KHÔNG ĐƯỢC LIÊN LẠC NHAU❗️❗️`);
						
						
						break;
				}

			}
		}

		
			//await this.sendMessage(`INDEX KILL PLAYER VAMPIRE ${iPlayerKilledByVampire}`);
			//await this.sendMessage(`INDEX KILL PLAYER VAMPIRE ${this.iPlayerKilledByVampire}`);

		// night end, starting morning
		for (const movement of movements) {
			const player = this.playerManager.items[movement.indexPlayer];
			for (const commit of movement.data) {
				await asyncWait(2000);
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
			if(this.playerManager.items[iPlayerKilledByWolf].died == false){
			await this.sendMessage(
				`☀️ ${name} đã ${
					lmao[random(0, lmao.length - 1)]
				} `
			);
			}
			
			//  await this.sendMessage(`Testing: ${this.tannerwin} `);
			
			await player.die('SoiThuong');
		}
		

		if (iPlayerKilledByWitch != -1) {
			deadAmount++;
			const player = this.playerManager.items[iPlayerKilledByWitch];
			const {name, username} = player;
			await asyncWait(2000);
			if(this.playerManager.items[iPlayerKilledByWitch].died == false){
			await this.sendMessage(
				`☀️ ${deadAmount > 1 ? '' : ''}${name} đã ${
					lmao[random(0, lmao.length - 1)]
				} `
			);
			}
			
			await player.die('PhuThuy');
		}
		
		if (deadAmount > 0){	// await this.sendMessage(
			// 	`Vậy là đêm qua đã có ${gameConfig.symbols[deadAmount]} người chết!`
			// );
			await asyncWait(2000);
			await this.chat_sendStatus();
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
			message: '☀️ Chuẩn bị hết giờ !\n🤝HÃY CHỐT NGƯỜI BỊ TREO CỔ !🤝',
			timing: 10000
		});
		
		await asyncWait(20000);
		
		await this.u_timingSend({
			message: '🆘🆘🆘 Hết giờ 🆘🆘🆘\n⚠️ Check tin nhắn riêng !',
			timing: gameConfig.timeout.VOTEKILL,
			left: false
		});
		

		const groupPromises = [];
		for (const player of this.playerManager.items) {
			await asyncWait(2000);
			if (!player.died) groupPromises.push(player.voteKill());
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

		//await this.sendMessage(`TESTING: INDEX IPLAYERKILLEDBYVAMPIRE IS ${this.iPlayerKilledByVampire}`);
		
		
		if (voteChart.length == 0) {
			await asyncWait(2000);
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
		await asyncWait(2000);
		await this.sendMessage(voteResult);

		let iPlayerKilledByVampire = -1;
		const movementsvam = this.history_last().movements;
		for (const movement of this.u_getMovements('Vampire', movementsvam)) {
			for (const commit of movement.data) {
				if (commit.value == null) continue;
				switch (commit.code) {
				case gameConfig.code.VAMPIRE:
					iPlayerKilledByVampire = commit.value - 1;
					break;
				}
			}
	}
		if ((iPlayerKilledByVampire) != -1){
		const vampireKilledPlayer = this.playerManager.items[iPlayerKilledByVampire];
		if (!vampireKilledPlayer.died){
			await asyncWait(2000);
			await this.sendMessage(
				`☀️ ${vampireKilledPlayer.name} đã ${
					lmao[random(0, lmao.length - 1)]
				}  `
			);}
			vampireKilledPlayer.die('Vampire');
		}

		

		if (voteChart.length > 1 && voteChart[0].amount == voteChart[1].amount) {
			await asyncWait(2000);
			await this.sendMessage('🔥 Không ai bị treo cổ !(huề)\n🌙 Màn đêm buông xuống 🌙\n ❌ TIẾP TỤC LÀM TASK ❌ ');
		} else {
			const {index: hangedIndex, amount} = voteChart[0];
			const percent = amount / votes.length;
			const player = this.playerManager.items[hangedIndex];
			const {name, username, type} = player;
			
			if (percent >= 0.5) {
				// await this.sendMessage(`Treo cổ ${name}(${username}) ...`);
		const arrayminionPlayer = Array.from(this.playerManager.items);
		
		const werewolfsPlayer = arrayminionPlayer.filter(
			player => (player.type == "SoiThuong") || (player.type == "SoiAnChay") || (player.type == "SoiTienTri")
		);
		const werewolfsPlayerAlive = werewolfsPlayer.filter(
			wolves => !wolves.died
		);
		const arrayminionSetup = Array.from(this.setup);
		const werewolfsSetup = arrayminionSetup.filter(
			player => (player == "SoiThuong") || (player == "SoiAnChay") || (player == "SoiTienTri")
		);

		if((werewolfsSetup.length == werewolfsPlayerAlive.length)&&(this.playerManager.items[hangedIndex].type == 'Minion')){
			this.minionwin = true;
		}
	
				
				if(this.playerManager.items[hangedIndex].type == 'ChanDoi'){
					this.tannerwin = true;
					// await this.sendMessage(`Tanner checking: ${this.tannerwin} !\nBugs about this role please contact Andrei!`);
				}
				

				
				
				await asyncWait(2000);
				await this.sendMessage(
					`☀️ Treo cổ ${name}🥵\n🌙 Màn đêm buông xuống 🌙\n ❌ TIẾP TỤC LÀM TASK ❌ `
				);	
				await player.die();
				await asyncWait(2000);
				await this.chat_sendStatus();
			} else {
			
				const need = Math.ceil(votes.length / 2) - amount;
				await asyncWait(2000);
				await this.sendMessage(
					`⛔️ Không đủ vote cho ${name}\n(hiện tại: ${amount}, cần thêm: ${need} phiếu!)\n🌙 Màn đêm buông xuống 🌙\n ❌ TIẾP TỤC LÀM TASK ❌ `
				);
			}
		}
		
		
			
		
	      
	}
	// <-- core

	// ---------------------------------------------------------------------------

	// --> game utilities

	async sendMessage(message, threadID = this.threadID) {
		await kb2abot.helpers.fca.sendMessage(message, threadID);
	}

	allRole(){

		const cloneSetup = Array.from(this.setup);

		shuffle(cloneSetup);
		shuffle(cloneSetup);
		let occurence = cloneSetup.reduce((acc, curr) => {
			return acc[curr] ? ++acc[curr] : acc[curr] = 1, acc;
		}, {})
		
		let message = '';
		
		for (let i in occurence) {
			message +=  occurence[i] + ' ' + i + ' 🏀 ';
		}
			let messageRole = '';
			messageRole = message.slice(0,-3);

		   return messageRole;
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
		if (this.minionwin == true){
			return text? '🐺 (Minion)' : -1;
		}
		if(this.tannerwin == true){
			return text? 'Chan Doi 🤠' : 1;
		} 
		
		if(this.pairs.length == 2){
			if (this.playerManager.items.filter(player => !player.died).length == 2 &&
			!this.playerManager.items[this.pairs[0]].died &&
			!this.playerManager.items[this.pairs[1]].died){	
				this.couplewin = true;
														   }
							}		

if(this.couplewin == true){
			
	return text? '👦🏻 💘 👩🏻' : 2;
} 

const array2 = Array.from(this.playerManager.items);
var filteredvam = array2.filter(function(e, index, arr){
					
		if ((!e.died) && (e.type == "Vampire"))
				return e;
	});
// var filteredvam2 = array2.filter(function(e, index, arr){
					
// 		if ((!e.died) && (e.type !== "Vampire"))
// 				return e;
// 	});
if ((this.playerManager.items.filter(player => !player.died).length == 1) && (filteredvam.length == 1)){
		this.vampirewin = true;
}

if(this.vampirewin == true){		
	return text? '🧛' : 2;
} 
		
		
		let wwCount = 0;
		let danlangCount = 0;
		// let tannerCount = 0;
		// if(this.tannerwin = true){
		// 		tannerCount += 100;
		// } 
		for (const player of this.playerManager.items) {
			const {party} = gameConfig.data[player.type];
			if (player.died) continue;
			if ((party == -1) && (player.type !== "Minion")) wwCount++;
			if (party == 1) danlangCount++;
		
	}

		// if (tannerCount > 50) return text ? 'Testing' : 2;
		if (danlangCount <= wwCount) return text ? '🐺' : -1;
		if (wwCount <= 0) return text ? '👦🏻' : 1;
		return null;
		
	

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
