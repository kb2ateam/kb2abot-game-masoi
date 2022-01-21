import {Seer} from "../ability"
import Villager from "./Villager"

export default class Goodseer extends Villager {
	constructor(options) {
		super({
			...options,
			...{
				// your configuration
			}
		})
	}

	async onNight() {
		return [await this.request(Seer)]
	}
}
