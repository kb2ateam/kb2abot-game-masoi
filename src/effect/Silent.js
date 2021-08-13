module.exports = class Silent extends Effect {
	constructor() {
		super();
	}

	onMessage(message, reply) {
		// kick(message.senderID);
		throw new Error('Ban da chat :/ va se bi kick [Silent.js:8]');
	}
};
