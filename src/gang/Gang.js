import { DeathType } from "../enum"
import { Death } from "../type"

export default class Gang {
	constructor({ world } = {}) {
		this.world = world
		this.players = world.players.filter(player => player.gang == this.constructor)
	}

	async onNight(movementBefore) {
		return await Promise.all(
			this.players.map(player => player.onNight(movementBefore))
		)
	}

	async nightend(movements, listDeaths) {
		await Promise.all(
			movements.map(
				movement =>
				new Promise(resolve => {
					movement.ability
						.nightend(
							this.world.players[movement.index],
							movement.checkerResult,
							listDeaths
						)
						.then(result => {
							const deaths = []
								.concat(result)
								.filter(index => index || index == 0)
							listDeaths.push(
								...deaths.map(
									index =>
									new Death(
										this.world.players[movement.index],
										this.world.players[index],
										DeathType.P2P
									)
								)
							)
							resolve()
						})
				})
			)
		)
		await Promise.all(
			this.players.map(
				player =>
				new Promise(resolve => {
					player
						.nightend(
							movements.filter(movement => movement.index == player.index),
							listDeaths
						)
						.then(result => {
							const deaths = []
								.concat(result)
								.filter(index => index || index == 0)
							listDeaths.push(
								...deaths.map(
									index =>
									new Death(player, this.world.players[index], DeathType.P2P)
								)
							)
							resolve()
						})
				})
			)
		)
		return
	}

	async onMorning() {
		return await Promise.all(this.players.map(player => player.onMorning()))
	}
}
