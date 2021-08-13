module.exports = class Silent extends Effect {
	constructor() {
		super();
	}

	onNight() {
		throw new Error('Ban da bi benh, ko the can!');
	}
};
