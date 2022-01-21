import * as Format from "../format"
import Ability from "./Ability"

export default class VoteLynch extends Ability {
	static question(player) {
		return (
			"Vui lòng chọn 1 trong mấy người chơi dưới đây để vote treo cổ\n" +
			player.world.game.listPlayer({died: false})
		)
	}

	static check(player, value) {
		const index = player.format(
			value,
			Format.validIndex,
			Format.alive,
			Format.notSelf
		)
		player.sendMessage(
			`Bạn đã vote treo cổ ${player.world.players[index].name}!`
		)
		return index
	}

	static async nightend(player, value, listDeaths) {}
}
