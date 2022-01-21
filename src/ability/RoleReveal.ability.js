import * as Format from "../format"
import Ability from "./Ability"

export default class RoleReveal extends Ability {
	static question(player) {
		return (
			"Bạn muốn xem vai trò của ai trong danh sách:\n" +
			player.world.game.listPlayer()
		)
	}

	static check(player, value) {
		const index = player.format(value, Format.validIndex, Format.notSelf)
		player.sendMessage(
			`Bạn đã chọn xem vai trò của người chơi ${player.world.players[index].name}!`
		)
		return index
	}

	static async nightend(player, index, listDeaths) {
		if (index == null) return
		const target = player.world.players[index]
		await player.sendMessage(
			`Vai trò của ${target.name} là ${target.role.name}`
		)
	}
}
