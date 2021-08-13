const Ability = require('../ability');
const Format = require('../format');
const {symbols} = require('../helper');
const Villager = require('./Villager');

module.exports = class Witch extends Villager {
	constructor(options) {
		super({
			...options,
			...{}
		});
		this.potion = {
			save: true,
			kill: true
		};
	}

	async onNight(movementBefore) {
		const requests = [];

		if (this.potion.save) {
			const found = movementBefore.Werewolf.findIndex(
				mm => mm.ability == Ability.Bite
			);
			if (found != -1) {
				const movement = movementBefore.Werewolf[found];
				const victim = this.world.items[movement.index];
				requests.push(
					await this.request({
						async question() {
							return (
								`Đêm nay ${victim.name} sẽ bị lũ sói cắn, bạn có muốn sử dụng bình [cứu người] không? (còn 1 luọt)\n` +
								`${symbols[1]} Có ♥\n` +
								`${symbols[2]} Không 😈`
							);
						},
						async check(player, value) {
							const choose =
								player.format(value, ['1', '2']) == '1' ? true : false;

							if (choose)
								this.sendMessage(
									`Bạn sử dụng bình [cứu người] lên ${victim.name}!`
								);
							else this.sendMessage('Bạn đã chọn không!');
							return choose;
						},
						async nightend(player, choose, listDeaths) {
							if (choose == true) {
								this.potion.save = true;
								const index = listDeaths.findIndex(
									death => death.index == victim.index
								);
								if (index != -1) listDeaths.splice(index, 1);
							}
						}
					})
				);
			}
		}

		if (this.potion.kill) {
			requests.push(
				await this.request({
					async question() {
						return (
							`Bạn có muốn sử dụng ${
								requests.length > 0 ? 'thêm ' : ''
							}bình [giết người] để giết ai không? (còn 1 luọt)\n` +
							this.world.game.listPlayer({died: false})
						);
					},
					check(player, value) {
						const index = player.format(
							value,
							Format.validIndex,
							Format.isAlive,
							Format.notSelf
						);
						this.sendMessage(
							`Bạn đã chọn giết ${this.world.items[index].name}!`
						);
						return index;
					},
					async nightend(player, index) {
						if (!index) return;
						this.potion.kill = false;

						return index;
					}
				})
			);
		}
		return requests;
	}
};
