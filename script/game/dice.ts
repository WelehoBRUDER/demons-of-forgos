enum Dice {
	d3 = 3, // Used by cantrips
	d4 = 4,
	d6 = 6,
	d8 = 8,
	d10 = 10,
	d12 = 12,
	d20 = 20,
	d100 = 100,
}

class Die {
	type: Dice;
	constructor(type: Dice) {
		this.type = type;
	}

	roll(): number {
		return Math.floor(Math.random() * this.type) + 1;
	}

	rollMultiple(times: number): number[] {
		const rolls: number[] = [];
		for (let i = 0; i < times; i++) {
			rolls.push(this.roll());
		}
		return rolls;
	}
}

class DiceRoller {
	static roll(die: Dice, times: number = 1): number[] {
		const dieInstance = new Die(die);
		return dieInstance.rollMultiple(times);
	}
}
