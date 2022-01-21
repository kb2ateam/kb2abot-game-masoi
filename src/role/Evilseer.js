import {RoleReveal} from "../ability"
import Werewolf from "./Werewolf"

export default class Evilseer extends Werewolf {
	constructor(options) {
		super({
			...options,
			...{}
		})
	}

	async onNight() {
		return this.isAlone() ? [] : [await this.request(RoleReveal)]
	}

	async voteBite() {
		return this.isAlone() ? await super.voteBite() : []
	}

	isAlone() {
		const werewolfs = this.world.players.filter(
			player => player.role == Werewolf
		)
		const alives = werewolfs.filter(werewolf => !werewolf.died)
		return alives.length <= 0
	}
}
