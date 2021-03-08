module.exports = {

	timeout: {
		DELAY_STARTGAME: 1000,
		DISCUSS: 30000,
		VOTEKILL: 30000,
		BAOVE: 30000,
		PHUTHUY_CUU: 30000,
		PHUTHUY_GIET: 30000,
		SOITHUONG: 30000,
		THOSAN_NIGHT: 30000,
		THOSAN_TREOCO: 15000,
		TIENTRI: 30000,
	},

	setup: { //  Setup theo số lượng người chơi
		0: null, // Từ 0=3 không chơi được
		1: null,
		2: ["BaoVe", "SoiThuong"],
		3: ["BaoVe", "SoiThuong", "SoiThuong"],
		4: ["BaoVe", "PhuThuy", "SoiThuong", "ThoSan"],
		5: ["BaoVe", "PhuThuy", "SoiThuong", "ThoSan", "TienTri"],
		6: ["BaoVe", "PhuThuy", "SoiThuong", "ThoSan", "TienTri", "SoiThuong"],
		7: ["BaoVe", "PhuThuy", "SoiThuong", "ThoSan", "TienTri", "SoiThuong", "DanLang"],
	},

	arrange: [ // Thứ tự gọi Role
		"BaoVe",
		"SoiThuong",
		"TienTri",
		"PhuThuy",
		"ThoSan",
		"DanLang",
	],

	data: { // Data về các role (khi nhắn "help")
		BaoVe: {
			score: 0, // điểm cân bằng game
			party: 1, // -1 là sói, 0 là trung lập, 1 là dân làng
			effect: "Cứu dân làng",
			description: "Mỗi đêm, Bảo Vệ sẽ chọn một người bất kì để bảo vệ, nếu người mà Bảo Vệ chọn mà bị Sói cắn, sẽ không bị chết vào sáng hôm sau",
			note: "Bảo Vệ có quyền tự cứu mình, không được cứu 1 người 2 lượt liên tiếp",
			advice: "Cố gắng quan sát để cứu được người bị hại",
		},
		SoiThuong: {
			score: -3,
			party: -1,
			effect: "Giết dân làng",
			description: "Mỗi đêm, Ma Sói sẽ chọn 1 dân làng để giết",
			note: "Ma Sói có thể chọn không cắn. Ma Sói có thể tự cắn nhau (tự sát).",
		},
		TienTri: {
			score: 4,
			party: 1,
			effect: "Tìm ma sói",
			description: "Mỗi đêm, Nhà tiên tri sẽ chọn 1 người chơi để đoán, nếu đó là Sói, bot sẽ nhắn \"Sói\", ngược lại, nếu không phải thì bot sẽ nhắn \"Không phải Sói\"",
			note: "Nếu là phe trung lập bot vẫn sẽ nhắn \"Không phải Sói\"",
			advice: "Cố gắng quan sát để tìm ra sói trong đêm, ban ngày cố gắng thuyết phục mọi người",
		},
		PhuThuy: {
			score: 3,
			party: 1,
			effect: "Có 1 bình cứu người và 1 bình giết người",
			description: "Mỗi đêm, Phù thủy có quyền thực hiện hay không thực hiện chức năng của mình. Chức năng đó là chọn 1 người bị Sói cắn để cứu sống và giết chết 1 người mà phù thủy nghi là Sói",
			note: "Được quản trò chỉ ra người bị Sói cắn để cứu. Có quyền xài 1 hoặc cả 2 bình. Bình xài rồi sẽ mất tác dụng",
			advice: "Có quyền năng trong tay nên cần sử dụng khôn ngoan nhất có thể",
		},
		ThoSan: {
			score: 0,
			party: 1,
			effect: "Khi chết sẽ được chọn một người chết theo mình",
			description: "Trong đêm Thợ Săn sẽ chọn một người, nếu Thợ Săn chết trong đêm thì người bị Thợ Săn chọn sẽ chết chung với Thợ Săn. ( Nếu người bị Thợ Săn chọn chết trong đêm thì Thợ Săn không chết theo ). Ban ngày Thợ Săn bị treo cổ chết thì sẽ chọn một người chết theo mình.",
			note: "Thợ Săn bắn ai thì người đó chắc chắn phải chết",
			advice: "Chăm chú tìm ra Sói để bắn. Ra mặt khi cần thiết để đe dọa Sói",
		},
		DanLang: {
			score: 0,
			party: 1,
			effect: "Bạn là một người bình thường và tỉnh táo, có năng lực nghe được tiếng động lạ khi đêm về",
			description: "Dân làng cùng với những người có chức năng tìm cách lập luận và suy đoán ra đâu là Sói đang ẩn mình dưới lớp người",
			note: "Có nhiều thời gian và có nhiều cơ hội suy đoán hơn tất cả",
			advice: "Đừng để vai trò dân làng của bạn trở nên vô ích, bạn có thể treo cổ Sói mà!",
		},
	},

	code: { // developer only
		"VOTEKILL": 0,
		"BAOVE": 1,
		"SOITHUONG": 2,
		"TIENTRI": 3,
		"PHUTHUY_CUU": 4,
		"PHUTHUY_GIET": 5,
		"THOSAN_NIGHT": 6,
		"THOSAN_TREOCO": 7,
	},

	"symbols": { // emoji số
		0: "0⃣",
		1: "1⃣",
		2: "2⃣",
		3: "3⃣",
		4: "4⃣",
		5: "5⃣",
		6: "6⃣",
		7: "7⃣",
		8: "8⃣",
		9: "9⃣",
	},

};
