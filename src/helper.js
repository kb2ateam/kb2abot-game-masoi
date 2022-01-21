import { random } from "kb2abot/util/common"
import { Data } from "./constant"
import { Party } from "./enum"

export const symbols = {
	0: "0⃣",
	1: "1⃣",
	2: "2⃣",
	3: "3⃣",
	4: "4⃣",
	5: "5⃣",
	6: "6⃣",
	7: "7⃣",
	8: "8⃣",
	9: "9⃣"
}
for (let i = 10; i <= 1000; i++) {
	let number = i
	symbols[i] = ""
	while (number > 0) {
		symbols[i] = symbols[number % 10] + symbols[i]
		number = Math.floor(number / 10)
	}
}

export function randomItem(arr) {
	return arr[random(0, arr.length - 1)]
}

export function dataSetup(setup) {
	const roles = []
	for (let role in setup.roles) {
		roles.push(...new Array(setup.roles[role]).fill(role))
	}
	return {
		name: setup.name,
		roles,
		org: setup
	}
}

export function guide(role) {
	const roleName = role.constructor.name
	const { party, description, advice } = Data[roleName]
	let partyName
	for (partyName in Party)
		if (party == Party[partyName]) break
	return (
		`BẠN LÀ ${roleName.toUpperCase()}!\n` +
		`Phe: ${partyName} (vẫn có thể bị đổi)\n` +
		`Mô tả: ${description}\n` +
		`Lời khuyên: ${advice}`
	)
}
