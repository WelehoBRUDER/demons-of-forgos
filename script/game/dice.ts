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

	static attackRoll(attacker: Creature, target: Creature, ctx: AttackResult): AttackRollResult {
		const d20Roll = this.roll(Dice.d20)[0];
		const attackBonus = ctx.attackBonus;
		const totalRoll = d20Roll + attackBonus;
		const ac = target.stats.getAC();
		const targetAC = target.statusEffects.hasCondition(Condition.FLAT_FOOTED) ? ac.flatFooted : ac.full; // Should consider touch and flat-footed but development first, will add later
		const isCriticalThreat = d20Roll >= ctx.weapon.getCritRange();

		let criticalThreatResult: CriticalThreatResult = {
			isCriticalThreat: isCriticalThreat,
		};

		if (isCriticalThreat) {
			const confirmationRoll = this.critConfirmationRoll(attacker, target, ctx);
			criticalThreatResult.confirmationRoll = confirmationRoll.confirmationRoll;
			criticalThreatResult.isConfirmed = confirmationRoll.isConfirmed;
			criticalThreatResult.confirmationModifier = confirmationRoll.modifier;
		}

		return {
			attackRoll: d20Roll,
			modifier: attackBonus,
			totalRoll: totalRoll,
			isHit: totalRoll >= targetAC,
			isCritical: criticalThreatResult,
			ac: targetAC,
		};
	}

	static critConfirmationRoll(
		attacker: Creature,
		target: Creature,
		ctx: AttackResult,
	): { confirmationRoll: number; isConfirmed: boolean; modifier: number } {
		const d20Roll = this.roll(Dice.d20)[0];
		const attackBonus = ctx.attackBonus;
		const totalRoll = d20Roll + attackBonus;
		const targetAC = target.stats.getAC().full; // Should consider touch and flat-footed but development first, will add later
		return {
			confirmationRoll: totalRoll,
			isConfirmed: totalRoll >= targetAC,
			modifier: attackBonus,
		};
	}

	static rollBetween(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}

interface AttackRollResult {
	attackRoll: number;
	modifier: number;
	totalRoll: number;
	isHit: boolean;
	isCritical: CriticalThreatResult;
	ac?: number;
}

interface CriticalThreatResult {
	isCriticalThreat: boolean;
	confirmationRoll?: number;
	isConfirmed?: boolean;
	confirmationModifier?: number;
}
