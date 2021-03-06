const {Manager} = kb2abot.helpers;

module.exports = class History extends Manager {
	constructor() {
		super();
		this.gangCycle = [];
	}

	new(event) {
		this.add({event, data: {}});
	}

	add(gangName, gangData) {
		this.last().data[gangName] = gangData;
	}

	last() {
		return this.items[this.items.length - 1];
	}

	gang(gangName) {
		return this.last().data[gangName];
	}

	event(event, backward = true) {
		if (backward)
			for (let i = this.items.length - 1; i >= 0; i--)
				if (this.items[i].event == event) return this.items[i];
		return this.find({event});
	}
};
