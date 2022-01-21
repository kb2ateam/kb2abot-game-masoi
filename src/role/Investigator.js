import {Investigator as InvestigatorAbility} from "../ability"
import Villager from "./Villager"

export default class Investigator extends Villager {
	constructor(options) {
		super({
			...options,
			...{}
		})
	}

	async onNight() {
		return [await this.request(InvestigatorAbility)]
	}
}
