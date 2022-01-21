import Villager from "./Villager"
import {DeathType} from "../enum"

export default class Tanner extends Villager {
	constructor(options) {
		super({
			...options,
			...{}
		})
	}

	async die(death) {
		await super.die(death)
		if (death.type == DeathType.LYNCH) {
			this.world.endGame([this])
		}
	}
}
