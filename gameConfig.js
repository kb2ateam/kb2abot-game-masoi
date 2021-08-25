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
	CUPIDFIRST: 1,
	CUPIDSECOND: 2,
	BAOVE: 3,
	SOITHUONG: 4,
	TIENTRI: 5,
	PHUTHUY_CUU: 6,
	PHUTHUY_GIET: 7,
	THOSAN_NIGHT: 8,
	THOSAN_TREOCO: 9,
	SOITIENTRI_SEER: 10,
	SOITIENTRI_VOTE: 11,
	BANSOI_VOTE: 12,
	THAYDONG: 13,
	PHAPSUCAM: 14,
	VAMPIRE: 15,
	REVEALER: 16
};

const timeout = {
	// timeout cho từng event
	DELAY_STARTGAME: 10000,
	DISCUSS: 90000,
	VOTEKILL: 55000,
	CUPIDFIRST: 40000,
	CUPIDSECOND: 35000,
	BAOVE: 35000,
	PHUTHUY_CUU: 35000,
	PHUTHUY_GIET: 35000,
	SOITHUONG: 45000,
	THOSAN_NIGHT: 35000,
	THOSAN_TREOCO: 20000,
	TIENTRI: 35000,
	SOITIENTRI_SEER: 35000,
	SOITIENTRI_VOTE: 40000,
	BANSOI_VOTE: 40000,
	THAYDONG: 30000,
	PHAPSUCAM: 35000,
	REVEALER: 35000,
	VAMPIRE: 35000
};

const setup = {
	//  Setup theo số lượng người chơi
	3: ['Cupid', 'TienTri', 'SoiThuong'],
	4: ['DanLang', 'TienTri', 'BaoVe', 'SoiThuong'],
	5: ['BaoVe', 'TienTri', 'PhuThuy', 'SoiThuong', 'DanLang'],
	
	6: ['BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'Cupid'
],
	7: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'Cupid'
	],
	8: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'BanSoi',
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
		'SoiThuong'
	],
	10: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'Vampire',
		'Cupid',
		'ThayDong',
		'SoiThuong'
	],
	11: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'Cupid',
		'SoiThuong',
		'ThayDong',
		'Vampire',
		'BanSoi'
		
	],

	12: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'Cupid',
		'SoiThuong',
		'ChanDoi',
		'Vampire',
		'ThayDong',
		'BanSoi'
		
	],

	13: [
		'BaoVe',
		'SoiTienTri',
		'SoiThuong',
		'PhuThuy',
		'TienTri',
		'ThoSan',
		'SoiThuong',
		'Minion',
		'Vampire',
		'BanSoi',
		'ThayDong',
		'SoiThuong',
		'Cupid'
		
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
		'BanSoi',
		'ThayDong',
		'SoiThuong',
		'Vampire',
		'Minion',
		'Cupid'
		
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
		'DanLang',
		'Vampire',
		'Cupid',
		'ChanDoi',
		'SoiThuong',
		'BanSoi',
		'ThayDong'
		
	]
};


const setup2 = {
    //  Setup theo số lượng người chơi
    3: ['DanLang', 'DanLang', 'SoiThuong'],
    4: ['DanLang', 'TienTri', 'ThayDong', 'SoiThuong'],
    5: ['BaoVe', 'TienTri', 'PhuThuy', 'SoiThuong', 'DanLang'],
    
    6: ['BaoVe',
        'SoiTienTri',
        'SoiThuong',
        'PhuThuy',
        'TienTri',
        'Revealer'
],
    7: [
        'BaoVe',
        'SoiTienTri',
        'SoiThuong',
        'PhuThuy',
        'TienTri',
        'ThoSan',
        'DanLang'
    ],
    8: [
        'BaoVe',
        'SoiTienTri',
        'SoiThuong',
        'PhuThuy',
        'TienTri',
        'ThoSan',
        'BanSoi',
        'Revealer'
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
        'SoiThuong'
    ],
    10: [
        'BaoVe',
        'SoiTienTri',
        'SoiThuong',
        'PhuThuy',
        'TienTri',
        'ThoSan',
        'Vampire',
        'Cupid',
        'ThayDong',
        'SoiThuong'
    ],
    11: [
        'BaoVe',
        'SoiTienTri',
        'SoiThuong',
        'PhuThuy',
        'TienTri',
        'ThoSan',
        'Cupid',
        'SoiThuong',
        'ThayDong',
        'Vampire',
        'BanSoi'
        
    ],
 
    12: [
        'BaoVe',
        'SoiTienTri',
        'SoiThuong',
        'PhuThuy',
        'TienTri',
        'ThoSan',
        'Cupid',
        'SoiThuong',
        'ChanDoi',
        'Vampire',
        'ThayDong',
        'BanSoi'
        
    ],
 
    13: [
        'BaoVe',
        'SoiTienTri',
        'SoiThuong',
        'PhuThuy',
        'TienTri',
        'ThoSan',
        'SoiThuong',
        'Revealer',
        'Vampire',
        'BanSoi',
        'ThayDong',
        'SoiThuong',
        'Cupid'
        
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
        'Revealer',
        'ThayDong',
        'SoiThuong',
        'Vampire',
        'BanSoi',
        'Cupid'
        
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
        'BanSoi',
        'Vampire',
        'Cupid',
        'ChanDoi',
        'Minion',
        'Revealer',
        'ThayDong'
        
    ]
};


const arrange = [
	// Thứ tự gọi Role
	'Cupid',
	'BaoVe',
	'SoiTienTri',
	'BanSoi',
	'SoiThuong',
	'SoiAnChay',
	'TienTri',
	'PhuThuy',
	'ThoSan',
	'DanLang',
	'Mason',
	'Minion',
	'ChanDoi',
	'ThayDong',
	'PhapSuCam',
	'Vampire',
	'Revealer'
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
		note: 'Hãy cẩn thận trước những con Sói!',
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
		score: -5,
		party: -1,
		description:
			'Minion phe Sói, không có chức năng, Tiên Tri khi soi bạn vẫn thấy thuộc phe Dân Làng. Nếu phe Sói thắng thì Minion thắng.',
		note: 'Khi Minion bị treo cổ mà chưa có Sói nào chết thì phe Sói thắng trắng cùng Minion.',
		advice:
			'Cố gắng bảo vệ Sói khi thảo luận bạn nhé!'
	},
	SoiTienTri: {
		score: -120,
		party: -1,
		description:
			'Mỗi đêm, Sói Tiên Tri chọn 1 người chơi để soi role đến khi chỉ còn một mình nó trong team Sói',
		note:
			'Nếu trong phe Sói chỉ còn mỗi Sói Tiên Tri thì nó sẽ tự động trở thành thành Sói Thường',
		advice:
			'Cố gắng quan sát để tìm ra những kẻ quan trọng và bảo với mọi người'
	},
	PhapSuCam: {
		score: 25, // điểm cân bằng game
		party: 1, // -1 là sói, 0 là trung lập, 1 là dân làng
		description:
			'Mỗi đêm, Pháp Sư chọn một người để khoá mõm, người đó sẽ không được nói gì vào sáng hôm sau',
		note:
			'Không được khoá mõm 1 người 2 lần liên tiếp',
		advice: 'Cố gắng quan sát để khoá mõm hợp lý!'
	},
	ChanDoi: {
		score: 20,
		party: 1,
		description:
			'Chán Đời thuộc Dân Làng nhưng chỉ thắng khi cả làng treo cổ nó!',
		note: 'Tiên Tri soi Chán Đời vẫn sẽ ra phe Dân Làng! ',
		advice:
			'Cố gắng lừa mọi người treo cổ bạn nhé!'
	},
	ThayDong: {
		score: 90, // điểm cân bằng game
		party: 1, // -1 là sói, 0 là trung lập, 1 là dân làng
		description:
			'Thầy Đồng phe dân, có thể nói chuyện với người chết và hồi sinh 1 người bất kì',
		note:
			'Chỉ được hồi sinh 1 lần duy nhất mỗi game!\n❗️❗️Thầy Đồng chỉ được nói chuyện với người chết vào ban đêm❗️❗️',
		advice: 'Cố gắng quan sát để hồi sinh hợp lý!'
	},
	Mason: {
		score: 50,
		party: 1,
		description:
			'Mason phe dân, biết được anh em sinh đôi của mình là ai',
		note: 'Hãy phối hợp để tìm ra Sói!',
		advice:
			'Đừng để vai trò couple của bạn trở nên vô ích !'
	},
	SoiAnChay: {
		score: -50,
		party: -1,
		description: 'Mỗi đêm, Sói Ăn Chay thức dậy cùng các Sói khác',
		note: 'Khi chỉ còn một mình Sói Ăn Chay trong team Sói, Sói Ăn Chay không cắn người nhưng vẫn cố gắng giết hết dân làng',
		advice: 'Cố gắng giết hết phe Dân Làng !'
	},
	Revealer: {
		score: 60,
		party: 1,
		description: 'Mỗi đêm, Kẻ Khám Phá phe dân sẽ chỉ một người chơi. Nếu người chơi đó là Ma sói, Sói đó sẽ chết.',
		note: 'Nếu không phải Sói, Kẻ Khám Phá sẽ chết !',
		advice: 'Cố gắng chọn đúng Sói !'
	},
	Vampire: {
		score: 0,
		party: 2,
		description: 'Là Phe Thứ 3 ngoài Phe Sói và Phe dân. Mỗi đêm, Ma cà rồng sẽ chọn 1 người chơi là nạn nhân. Nhưng nạn nhân của Ma cà rồng sẽ được công bố sau khi phiên treo cổ diễn ra',
		note: 'Vampire không thể bị giết bởi Sói vào ban đêm ! Tiên Tri soi Vampire ra phe trung lập',
		advice: 'Cố gắng giết hết các phe khác !'
	},
	BanSoi: {
		score: -30,
		party: 1,
		description: 'Bán sói phe Dân, nhưng nếu bị cắn sẽ không chết mà bị biến thành Sói',
		note: 'Bị Sói cắn không chết mà biến thành Sói Thường, Tiên Tri soi ra phe Sói',
		advice: 'Cố gắng giết hết phe Dân Làng'
	},
	Cupid: {
		score: 0,
		party: 1,
		description: 'Cupid phe Dân, đầu game ghép đôi 2 người bất kỳ với nhau, cặp đôi Cupid đã ghép sẽ thắng khi chỉ còn cặp đôi sống sót cuối cùng.',
		note: 'Cupid có thể tự ghép chính mình nhưng\n⚠️Không được chọn ghép trùng lặp⚠️',
		advice: 'Cố gắng giết hết phe Dân Làng'
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
	setup2,
	arrange,
	data,
	code,
	symbols
};
