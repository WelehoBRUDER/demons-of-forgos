class CreatureClasses {
	private owner: DynamicCreature;
	classes: ICreatureClassLevel[];

	constructor(owner: DynamicCreature, data?: ICreatureClasses) {
		this.owner = owner;
		this.classes = data?.classes || [];
	}

	getAllClasses(): ICreatureClassLevel[] {
		return this.classes;
	}

	addClassLevel(creatureClass: CreatureClass, level: number = 1) {
		const isPrimary = this.classes.length === 0; // First class added is the primary class
		if (isPrimary) {
			this.classes.push({ class: creatureClass, level, isPrimary });
		} else {
			const existingClassIndex = this.classes.findIndex((c) => c.class.id === creatureClass.id);
			if (existingClassIndex !== -1) {
				// If the class already exists, just increase the level
				this.classes[existingClassIndex].level += level;
			} else {
				// Otherwise, add a new class level entry
				this.classes.push({ class: creatureClass, level, isPrimary: false });
			}
		}
		this.owner.providersNeedUpdate = true; // Mark providers as needing update since class levels can change modifiers
	}

	getTotalSaves(): Saves {
		const totalSaves: Saves = { [Save.FORTITUDE]: 0, [Save.REFLEX]: 0, [Save.WILL]: 0 };

		for (const classLevel of this.classes) {
			const classSaves = classLevel.class.getSavesAtLevel(classLevel.level);
			totalSaves[Save.FORTITUDE] += classSaves[Save.FORTITUDE];
			totalSaves[Save.REFLEX] += classSaves[Save.REFLEX];
			totalSaves[Save.WILL] += classSaves[Save.WILL];
		}

		return totalSaves;
	}

	getHitDice(): HitDieInfo[] {
		const hitDice: HitDieInfo[] = [];
		for (const classLevel of this.classes) {
			hitDice.push({ type: classLevel.class.hitDie, count: classLevel.level });
		}
		return hitDice;
	}

	getPrimaryClass(): CreatureClass | null {
		const primaryClassLevel = this.classes.find((c) => c.isPrimary);
		return primaryClassLevel ? primaryClassLevel.class : null;
	}

	// This function returns the difference between average and full die for the first class
	// At 1st level, creatures get the full hit die, but afterwards they take the average.
	getPrimaryClassHitDieDifference(): number {
		if (this.classes.length === 0) return 0;
		const primaryClassLevel = this.classes.find((c) => c.isPrimary);
		if (!primaryClassLevel) return 0;
		const hitDieType = primaryClassLevel.class.hitDie;
		const averageHitDie = Math.floor(hitDieType / 2) + 1;
		return hitDieType - averageHitDie;
	}

	getBaseAttackBonus(): number {
		let bab = 0;
		for (const classLevel of this.classes) {
			bab += Math.floor(classLevel.level * classLevel.class.bab);
		}
		return bab;
	}

	getTotalLevel(): number {
		return this.classes.reduce((total, classLevel) => total + classLevel.level, 0);
	}
}
