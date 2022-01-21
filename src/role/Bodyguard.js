import {Protect} from "../ability"
import Villager from "./Villager"

export default class Bodyguard extends Villager {
	constructor(options) {
		super({
			...options,
			...{}
		})
		this.lastProtectIndex = -1
	}

	async onNight() {
		return [await this.request(Protect)]
	}
}
