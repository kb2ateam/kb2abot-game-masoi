export default (player, value) => {
	const number = Number(value)
	if (isNaN(number)) throw new Error("Vui lòng nhập số")
	if (number < 1 || number > player.world.players.length)
		throw new Error("Bạn cần nhập số trong khoảng đã cho!")
	return number - 1
}
