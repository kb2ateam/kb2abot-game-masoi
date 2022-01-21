import { Party } from "../enum"
import Role from "./Role"

export default class Villager extends Role {
	constructor(options) {
		super({
			...options,
			...{}
		})
	}

	isWin() {
		const werewolfCount = this.world.players.filter(
			player => !player.died && player.party == Party.WEREWOLF
		).length
		return werewolfCount <= 0
	}
}
