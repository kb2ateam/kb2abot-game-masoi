import {Kill} from "../ability"
import {DeathType} from "../enum"
import {Death} from "../type"
import Villager from "./Villager"

export default class Hunter extends Villager {
	constructor(options) {
		super({
			...options,
			...{}
		})
	}

	async die(death) {
		await super.die(death)
		if (death.type == DeathType.LYNCH)
			await this.sendMessage("Bạn đang bị cả làng treo cổ!")
		else await this.sendMessage("Bạn đã bị giết!")

		const {checkerResult} = await this.request(Kill)
		if (checkerResult != null) {
			const victim = this.world.players[checkerResult]
			await victim.sendMessage("Bạn đã bị [Hunter] bắn chết!")
			await this.world.game.sendMessage(
				"Có một tiếng súng vang lên khắp cả làng!"
			)
			await victim.die(new Death(this, victim, DeathType.P2P))
		}
	}
}
