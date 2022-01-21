import { GameSchema, StateManager, gameManager } from "kb2abot-plugin-internal"
import { asyncWait, shuffle } from "kb2abot/util/common"
import { Data } from "./constant"
import { State, Party } from "./enum"
import * as Role from "./role"
import * as World from "./world"
import { dataSetup, symbols, guide } from "./helper"
// verify()

export default class MasoiGame extends GameSchema {
	constructor(options = {}) {
		super({
			...options,
			...{
				name: "Ma Sói"
			}
		})
		const indexVillage = Number(options.param) - 1
		if (!this.isGroup)
			throw new Error("Không thể tạo game masoi trong tin nhắn riêng tư!")
		if (!options.param || isNaN(indexVillage))
			throw new Error([
				"Hướng dẫn tạo: /game masoi <mã số làng>",
				"Thông tin các làng:",
				this.plugin.config.setups.map((setup, index) => {
					const { name, roles } = dataSetup(setup)
					return `${symbols[index + 1]}  ${name} (${roles.length} người)`
				}).join("\n")
			].join("\n"))
		if (!this.plugin.config.setups[indexVillage])
			throw new Error(
				`Không tìm thấy làng với mã số ${symbols[options.param]}!`
			)
		this.setup = dataSetup(this.plugin.config.setups[indexVillage])
		this.state = new StateManager([State.SETUP, State.PLAY])
		this.world = new World.Normal({
			game: this
		})

		this.sendMessage(
			"Đã tạo thành công game ma sói!\n" +
			`Làng: ${this.setup.name}\n ` +
			`Số lượng: ${this.setup.roles.length}\n` +
			`Nhắn "${this.plugin.config.ready}" để vào game \n Nếu muốn kết thúc game thì nhắn "end!"\n` +
			`Số người sẵn sàng: 1/${this.setup.roles.length}`
		)
	}

	async clean() {
		await super.clean()
		if (this.world.isEnd) return
		this.world.endGame()
		for (const player of this.world.players) {
			player.resolve([null, null])
		}
	}

	// ---------------------------------------------------------------------------

	async onMessage(thread, message, reply) {
		await super.onMessage(message, reply)

		if (message.body.toLowerCase() == "end!") {
			if (message.senderID == this.masterID) {
				await gameManager.clean(this.threadID)
				if (this.state.getCurrent() == State.SETUP)
					await reply("Đã hủy bỏ game!")
			} else {
				await reply("Chỉ có chủ tạo game mới có thể end!")
			}
		}

		const curState = this.state.getCurrent()
		switch (curState) {
		case State.SETUP:
			await this.stateSetup(thread, message, reply)
			break
		case State.PLAY:
			if (this.participants.includes(message.senderID))
				await this.statePlay(thread, message, reply)
			break
		}
	}

	//  ____ _____  _  _____ _____
	// / ___|_   _|/ \|_   _| ____|
	// \___ \ | | / _ \ | | |  _|
	//  ___) || |/ ___ \| | | |___
	// |____/ |_/_/   \_\_| |_____|

	async stateSetup(thread, message, reply) {
		console.log(message)
		if (
			(message.body.toLowerCase() == this.plugin.config.ready &&
				this.participants.length < this.setup.roles.length &&
				!this.participants.includes(message.senderID)) || (1 == 1)
		) {
			this.participants.push(message.senderID)

			if (this.participants.length == this.setup.roles.length) {
				this.state.next()
				const { nicknames } = await this.api.getThreadInfo(message.threadID)
				const infos = await this.api.getUserInfo(this.participants)
				const names = {}
				shuffle(this.setup.roles)
				for (const id of this.participants) {
					names[id] = nicknames[id] || infos[id].name
				}
				for (let i = 0; i < this.participants.length; i++) {
					const participantID = this.participants[i]
					const player = new Role[this.setup.roles[i]]({
						id: message.senderID,
						index: this.world.players.length,
						world: this.world,
						name: names[participantID] || "<Chưa kết bạn>",
						threadID: participantID
					})
					this.world.players.push(player)
					this.sendMessage(guide(player), player.threadID)
				}
				const werewolfParty = this.world.players.filter(
					e => e.party == Party.WEREWOLF
				)
				const nameMap = werewolfParty.map(e => e.name)
				for (const player of werewolfParty) {
					if (nameMap.length > 1)
						await player.sendMessage(
							`Những người cùng phe với bạn là: ${nameMap
								.filter(name => name != player.name)
								.join(
									", "
								)}\n Hãy liên hệ với họ để có 1 teamwork tốt nhất nhé!`
						)
				}
				let balanceScore = 0
				for (const role of this.setup.roles) {
					balanceScore += Data[role].score
				}
				this.sendMessage(
					this.timing({
						message: `⚖ Điểm cân bằng: ${balanceScore}\n` +
							"📖 Danh sách lệnh (không cần prefix):\n===GROUP===\n1.\"help\": Xem role của mình!\n2.\"status\": Tình trạng các người chơi còn sống\n===PRIVATE===\n1.\"pass\": Bỏ qua lượt\n" +
							"\nHãy xem kĩ chi tiết role của mình, trò chơi bắt đầu sau",
						time: this.plugin.config.timeout.DELAY_STARTGAME,
						left: false
					})
				)
				await asyncWait(this.plugin.config.timeout.DELAY_STARTGAME)
				this.world.startLoop()
			} else {
				await this.sendMessage(
					`Tình trạng: ${this.participants.length}/${this.setup.roles.length}!`
				)
			}
		}
	}

	async statePlay(thread, message, reply) {
		if (!this.participants.includes(message.senderID))
			return
		if (message.body.toLowerCase() != "end!") {
			const player = this.world.players.get(message.senderID)
			switch (message.body.toLowerCase()) {
			case "help":
				await this.sendMessage(guide(player), message.senderID)
				break
			case "status":
				await this.sendStatus(message.threadID)
				break
			}
			if (!message.isGroup)
				this.world.players.get(message.senderID).onMessage(message, reply)
		}
	}

	//  _   _ _____ ___ _
	// | | | |_   _|_ _| |
	// | | | | | |  | || |
	// | |_| | | |  | || |___
	//  \___/  |_| |___|_____|

	sendMessage(message, threadID = this.threadID) {
		return this.api.sendMessage(message, threadID)
	}

	timing({ message = "", time = 0, left = true } = {}) {
		if (time < 0) time = 0
		const hh = Math.floor(time / 1000 / 60 / 60)
		const mm = Math.floor((time - hh * 60 * 60 * 1000) / 1000 / 60)
		const ss = Math.ceil((time - hh * 60 * 60 * 1000 - mm * 60 * 1000) / 1000)
		let text = `${ss}s`
		if (mm > 0) text = `${mm}m ${text}`
		if (hh > 0) text = `${hh}h ${text}`
		return left ? `[${text}] ${message}` : `${message} [${text}]`
	}

	//   ____ _   _    _  _____
	//  / ___| | | |  / \|_   _|
	// | |   | |_| | / _ \ | |
	// | |___|  _  |/ ___ \| |
	//  \____|_| |_/_/   \_\_|

	listPlayer(filter = {}) {
		let text = ""
		for (let index = 0; index < this.world.getLength(); index++) {
			const player = this.world.players[index]

			let pass = true
			for (const key in filter) {
				if (player[key] !== filter[key]) {
					pass = false
					break
				}
			}

			if (pass)
				text += `${symbols[index + 1]} ${player.name} ${
					player.died ? " - đã chết" : ""
				}\n`
		}
		return text
	}

	async sendStatus(threadID = this.threadID) {
		await this.sendMessage(
			`Tình trạng game:\n${this.listPlayer({died: false})}`,
			threadID
		)
	}
}
