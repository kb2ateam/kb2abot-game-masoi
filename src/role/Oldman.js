import Werewolf from "./Werewolf"
import Villager from "./Villager"

export default class Oldman extends Villager {
	constructor(options) {
		super({
			...options,
			...{}
		})
		this.dayPassed = 0
	}

	async nightend() {
		const wwAmount = this.world.players.filter(
			player => player.constructor == Werewolf
		).length
		if (++this.dayPassed >= wwAmount + 1) {
			return this.index
		}
	}
}
