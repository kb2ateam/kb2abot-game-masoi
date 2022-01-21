import {Seer} from "../ability"
import Goodseer from "./Goodseer"
import Villager from "./Villager"

export default class Apprentice extends Villager {
	constructor(options) {
		super({
			...options,
			...{}
		})
	}

	async onNight() {
		return this.isAlone() ? [await this.request(Seer)] : []
	}

	isAlone() {
		const seers = this.world.players.filter(player => player.role == Goodseer)
		const alives = seers.filter(seer => !seer.died)
		return alives.length <= 0
	}
}
