class CreatureClass implements ICreatureClass {
	id: string;
	bab: BAB;
	hitDie: HitDice;
	saves: { [key in Save]: SaveProgression };

	constructor(data: ICreatureClass) {
		this.id = data.id;
		this.bab = data.bab;
		this.hitDie = data.hitDie;
		this.saves = data.saves;
	}

	getHitDie(): HitDieInfo {
		return {
			type: this.hitDie,
			count: 1,
		};
	}

	getBABAtLevel(level: number): number {
		return Math.floor(level * this.bab);
	}

	getSavesAtLevel(level: number): Saves {
		const saves: Saves = {
			[Save.FORTITUDE]: Math.floor(level * this.saves[Save.FORTITUDE]),
			[Save.REFLEX]: Math.floor(level * this.saves[Save.REFLEX]),
			[Save.WILL]: Math.floor(level * this.saves[Save.WILL]),
		};

		for (const save in this.saves) {
			if (this.saves[save as Save] === SaveProgression.GOOD) {
				saves[save as Save] += 2; // Good saves get an additional +2 at level 1
			}
		}

		return saves;
	}
}
