import * as Format from "../format"
import Ability from "./Ability"

export default class Kill extends Ability {
	static question(player) {
		"Bạn muốn giết ai trong danh sách:\n" +
			player.world.game.listPlayer({died: false})
	}

	static check(player, value) {
		const index = player.format(
			value,
			Format.validIndex,
			Format.alive,
			Format.notSelf
		)
		const {name} = player.world.players[index]
		player.sendMessage(`Bạn đã chọn giết ${name}!`)
		return index
	}

	static async nightend(player, index, listDeaths) {
		if (index == null) return
		return index
	}
}
