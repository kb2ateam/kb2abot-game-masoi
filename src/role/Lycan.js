import Werewolf from "./Werewolf"
import Villager from "./Villager"

export default class Lycan extends Villager {
	constructor(options) {
		super({
			...options,
			...{
				role: Werewolf
			}
		})
	}
}
