import {Bite} from "../ability"
import * as Format from "../format"
import {Werewolf as WerewolfGang} from "../gang"
import Villager from "./Villager"
import { symbols } from "../helper"

export default class Witch extends Villager {
	constructor(options) {
		super({
			...options,
			...{}
		})
		this.potion = {
			save: true,
			kill: true
		}
	}

	async onNight(movementBefore) {
		const requests = []
		const movements = movementBefore.Werewolf.filters(
			mm => mm.ability == Bite
		)
		const result = WerewolfGang.resultVoting(
			movements,
			this.world.players.length
		)

		if (result.indexKill != -1 && this.potion.save) {
			const victim = this.world.players[result.indexKill]
			requests.push(
				await this.request({
					question() {
						return (
							`Đêm nay ${victim.name} sẽ bị lũ sói cắn, bạn có muốn sử dụng bình [cứu người] không?\n` +
							`${symbols[1]} Có ♥\n` +
							`${symbols[2]} Không 😈`
						)
					},
					check(player, value) {
						const choose = player.format(value, ["1", "2"]) == "1"
						player.sendMessage(
							choose ?
							`Bạn sử dụng bình [cứu người] lên ${victim.name}!` :
							`Bạn đã chọn không cứu ${victim.name}!`
						)
						return choose
					},
					async nightend(player, choose, listDeaths) {
						if (choose == null) return
						if (choose == true) {
							player.potion.save = true
							const index = listDeaths.findIndex(
								death => death.index == victim.index
							)
							if (index != -1) listDeaths.splice(index, 1)
						}
					}
				})
			)
		}

		if (this.potion.kill) {
			requests.push(
				await this.request({
					question(player) {
						return (
							`Bạn có muốn sử dụng ${
								requests.length > 0 ? "thêm " : ""
							}bình [giết người] để giết ai không?\n` +
							player.world.game.listPlayer({ died: false })
						)
					},
					check(player, value) {
						const index = player.format(
							value,
							Format.validIndex,
							Format.isAlive,
							Format.notSelf
						)
						player.sendMessage(
							`Bạn đã chọn giết ${player.world.players[index].name}!`
						)
						return index
					},
					async nightend(player, index) {
						if (index == null) return
						player.potion.kill = false
						return index
					}
				})
			)
		}
		return requests
	}
}
