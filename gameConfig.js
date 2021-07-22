const version = '1.2.3';
// Phiên bản của file config, nếu khác thì phải xóa file gameConfig.js
// Một file gameConfig.js sẽ đc tạo lại sau khi run lại bot
(async () => {
	const path = require('path');
	const axios = require('axios');
	if (path.basename(__filename) == 'gameConfig.example.js') return;
	const exVer = require('./gameConfig.example.js').version;
	const curVer = (
		await axios.get(
			'https://drive.google.com/u/0/uc?id=14CIBFaNe9tz9Iz0bqW5V6etEwlCZCe2R&export=download'
		)
	).data.version;
	if (exVer != curVer) {
		console.newLogger.warn(
			`Ma Soi: Da co phien ban moi: ${curVer}! Phien ban hien tai: ${exVer}. Hay truy cap bit.ly/kb2abot`
		);
	}
	if (version != exVer) {
		console.newLogger.warn(
			'Ma Soi: Phien ban config khong tuong thich co the gay loi, vui long backup va xoa file gameConfig.js'
		);
	}
})();

const code = {
	// developer only (cái này chỉ là phân loại th, ko nên chỉnh)
	VOTEKILL: 0,
	BAOVE: 1,
	SOITHUONG: 2,
	TIENTRI: 3,
	PHUTHUY_CUU: 4,
	PHUTHUY_GIET: 5,
	THOSAN_NIGHT: 6,
	THOSAN_TREOCO: 7,
	SOITIENTRI_RESIGN: 8,
	SOITIENTRI_SEER: 9,
	SOITIENTRI_VOTE: 10,
	THAYDONG: 11,
	PHAPSUCAM: 12
};

const timeout = {
	// timeout cho từng event
	DELAY_STARTGAME: 10000,
	DISCUSS: 90000,
	VOTEKILL: 55000,
	BAOVE: 35000,
	PHUTHUY_CUU: 35000,
	PHUTHUY_GIET: 35000,
	SOITHUONG: 45000,
	THOSAN_NIGHT: 35000,
	THOSAN_TREOCO: 20000,
	TIENTRI: 35000,
	SOITIENTRI_RESIGN: 30000,
	SOITIENTRI_SEER: 35000,
	SOITIENTRI_VOTE: 40000,
	THAYDONG: 30000,
	PHAPSUCAM: 35000
};

const setup = {
	//  Setup theo số lượng người chơi
	3: ['TienTri', 'SoiThuong', 'DanLang'],
	4: ['DanLang', 'TienTri', 'SoiThuong', 'BaoVe'],
	5: ['BaoVe', 'TienTri', 'PhuThuy', 'SoiThuong', 'SoiThuong'],
	
	6: ['BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'PhapSuCam'
],
	7: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'PhapSuCam'
	],
	8: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'Minion',
		'ThayDong'
	],
	9: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'ChanDoi',
		'ThayDong',
		'Minion'
	],
	10: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'ChanDoi',
		'SoiThuong',
		'ThayDong',
		'Minion'
	],
	11: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'ChanDoi',
		'SoiThuong',
		'ThayDong',
		'Minion',
		'PhapSuCam'
		
	],

	12: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'ChanDoi',
		'SoiThuong',
		'PhapSuCam',
		'SoiThuong',
		'ThayDong',
		'Minion'
		
	],

	13: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'SoiThuong',
		'ChanDoi',
		'DanLang',
		'SoiThuong',
		'ThayDong',
		'Minion',
		'PhapSuCam'
		
	],

	14: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'SoiThuong',
		'ChanDoi',
		'PhapSuCam',
		'ThayDong',
		'SoiThuong',
		'Minion',
		'SoiThuong',
		'DanLang'
		
	],

	15: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'SoiThuong',
		'SoiThuong',
		'PhapSuCam',
		'Minion',
		'ChanDoi',
		'SoiThuong',
		'Minion',
		'DanLang',
		'ThayDong'
		
	]
};

const arrange = [
	// Thứ tự gọi Role
	'BaoVe',
	'SoiTienTri',
	'SoiThuong',
	'TienTri',
	'PhuThuy',
	'ThoSan',
	'DanLang',
	'Minion',
	'ChanDoi',
	'ThayDong',
	'PhapSuCam'
];

const data = {
	// Data về các role (khi nhắn "help")
	BaoVe: {
		score: 45, // điểm cân bằng game
		party: 1, // -1 là sói, 0 là trung lập, 1 là dân làng
		description:
			'Mỗi đêm, Bảo Vệ chọn một người bất kì để bảo vệ, nếu người đó bị Sói cắn, sẽ không bị chết vào buổi sáng',
		note:
			'Bảo Vệ được tự bảo vệ mình, không được bảo vệ 1 người 2 lần liên tiếp',
		advice: 'Cố gắng quan sát để cứu được người bị hại'
	},
	SoiThuong: {
		score: -100,
		party: -1,
		description: 'Mỗi đêm, Sói chọn 1 dân làng để giết',
		note: 'Các Sói phải thống nhất người cần giết, nếu khác nhau sẽ không cắn được',
		advice: 'Cố gắng giết hết phe Dân Làng'
	},
	TienTri: {
		score: 25,
		party: 1,
		description: 'Mỗi đêm, Tiên Tri chọn 1 người chơi để soi phe',
		note: 'Phe trung lập vẫn soi ra là phe Dân Làng! Cẩn thận!',
		advice:
			'Cố gắng quan sát để tìm ra sói trong đêm, ban ngày cố gắng thuyết phục mọi người'
	},
	PhuThuy: {
		score: -35,
		party: 1,
		description:
			'Phù Thủy có 2 chức năng là cứu sống 1 người sắp chết và giết chết 1 người mà Phù Thủy muốn',
		note: 'Có quyền xài 1 hoặc cả 2 bình. Bình xài rồi sẽ mất tác dụng',
		advice: 'Có quyền năng trong tay nên cần sử dụng khôn ngoan nhất có thể'
	},
	ThoSan: {
		score: 35,
		party: 1,
		description:
			'Trong đêm Thợ Săn chọn một người, nếu Thợ Săn chết thì sẽ kéo theo người đó chết',
		note: 'Thợ Săn bắn ai thì chắc chắn phải chết',
		advice: 'Chăm chú tìm ra Sói để bắn'
	},
	DanLang: {
		score: 0,
		party: 1,
		description:
			'Dân làng cùng những người khác lập luận và suy đoán ai là Sói',
		note: 'Có nhiều thời gian và có nhiều cơ hội suy đoán hơn tất cả',
		advice:
			'Đừng để vai trò dân làng của bạn trở nên vô ích, bạn có thể treo cổ Sói mà!'
	},
	Minion: {
		score: 0,
		party: 2,
		description:
			'Minion phe Sói, không có chức năng, Tiên Tri khi soi bạn vẫn thấy thuộc phe Dân Làng. Nếu phe Sói thắng thì Minion thắng.',
		note: 'Chỉ các Minion biết nhau và cùng bảo vệ Sói khi trời sáng, không được cho Sói biết bạn là Minion.',
		advice:
			'Cố gắng bảo vệ Sói khi thảo luận bạn nhé!'
	},
	SoiTienTri: {
		score: -150,
		party: -1,
		description:
			'Mỗi đêm, Sói Tiên Tri chọn 1 người chơi để soi role hoặc có thể trở thành Sói Thường bất cứ lúc nào (sẽ mất chức năng tiên tri)',
		note:
			'Nếu trong phe Sói chỉ còn mỗi Sói Tiên Tri thì nó sẽ tự động trở thành thành Sói Thường',
		advice:
			'Cố gắng quan sát để tìm ra những kẻ quan trọng và bảo với mọi người'
	},
	PhapSuCam: {
		score: 0, // điểm cân bằng game
		party: 1, // -1 là sói, 0 là trung lập, 1 là dân làng
		description:
			'Mỗi đêm, Pháp Sư chọn một người để khoá mõm, người đó sẽ không được nói gì vào sáng hôm sau',
		note:
			'Không được khoá mõm 1 người 2 lần liên tiếp',
		advice: 'Cố gắng quan sát để khoá mõm hợp lý!'
	},
	ChanDoi: {
		score: 0,
		party: 1,
		description:
			'Chán Đời thuộc Dân Làng nhưng chỉ thắng khi cả làng treo cổ nó!',
		note: 'Tiên Tri soi Chán Đời vẫn sẽ ra phe Dân Làng! ',
		advice:
			'Cố gắng lừa mọi người treo cổ bạn nhé!'
	},
	ThayDong: {
		score: 0, // điểm cân bằng game
		party: 1, // -1 là sói, 0 là trung lập, 1 là dân làng
		description:
			'Thầy Đồng phe dân, có thể nói chuyện với người chết và hồi sinh 1 người bất kì',
		note:
			'Chỉ được hồi sinh 1 lần duy nhất mỗi game! Thầy Đồng spoil quá nhiều là bị chửi ;)',
		advice: 'Cố gắng quan sát để hồi sinh hợp lý!'
	}

};

const symbols = {
	// emoji số
	0: '0⃣',
	1: '1⃣',
	2: '2⃣',
	3: '3⃣',
	4: '4⃣',
	5: '5⃣',
	6: '6⃣',
	7: '7⃣',
	8: '8⃣',
	9: '9⃣'
};
for (let i = 10; i <= 1000; i++) {
	let number = i;
	symbols[i] = '';
	while (number > 0) {
		symbols[i] = symbols[number % 10] + symbols[i];
		number = Math.floor(number / 10);
	}
}

module.exports = {
	version,
	timeout,
	setup,
	arrange,
	data,
	code,
	symbols
};
