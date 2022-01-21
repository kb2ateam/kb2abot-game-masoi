import Role from "./Role"
import {Werewolf as WerewolfGang} from "../gang"
import {Bite} from "../ability"
import { Party } from "../enum"

export default class Werewolf extends Role {
	constructor(options) {
		super({
			...options,
			...{
				gang: WerewolfGang
			}
		})
	}

	async voteBite() {
		return [await this.request(Bite)]
	}

	isWin() {
		const werewolfCount = this.world.players.filter(
			player => !player.died && player.party == Party.WEREWOLF
		).length
		const villagerCount = this.world.players.filter(
			player => !player.died && player.party == Party.VILLAGER
		).length
		return werewolfCount >= villagerCount
	}
}
