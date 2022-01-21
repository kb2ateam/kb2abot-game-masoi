export default (player, index) => {
	if (player.world.players[index].died)
		throw new Error("Người chơi này đã chết!")
	return index
}
