class CreatureCombat implements ICreatureCombat {
	private owner: Creature;
	bab: number;
	initiative: number;

	constructor(owner: Creature, combatData: ICreatureCombat) {
		this.owner = owner;
		this.bab = combatData?.bab || 0;
		this.initiative = combatData?.initiative || -Infinity; // -Infinity means initiative has not been rolled yet
	}

	getBaseAttackBonus(): number {
		return this.bab; // This should be calculated based on class levels for player characters or set as a static value for enemies
	}

	buildAttack(ctx: AttackContext): AttackResult {
		const weapon = ctx.weapon;

		const damageDice = this.handleDamageDieProgression(weapon.getDamage());

		const attackBonus = this.getWeaponAttackBonus(ctx);

		const [damageMin, damageMax] = this.calculateBaseDamage(damageDice, ctx);

		const critRange = weapon.getCritRange();
		const critMultiplier = weapon.getCritMultiplier();

		return {
			weapon,
			attackBonus,
			damageMin,
			damageMax,
			damageType: weapon.getDamageType(),
			criticalThreatRange: critRange,
			criticalMultiplier: critMultiplier,
		};
	}

	getAttackResults(): AttackResult[] {
		return this.owner.inventory.getEquippedWeapons().map((ctx) => this.buildAttack(ctx));
	}

	formatAttackResult(attackResult: AttackResult): string {
		if (!attackResult) return "";
		const criticalThreatRangeText = attackResult.criticalThreatRange < 20 ? `${attackResult.criticalThreatRange}-20` : "20";
		const attackBonusText: string = attackResult.attackBonus >= 0 ? `+${attackResult.attackBonus}` : `${attackResult.attackBonus}`;
		return `${attackResult.weapon.getId()} ${attackBonusText} to hit, Damage: ${attackResult.damageMin}-${attackResult.damageMax} ${attackResult.damageType}, Crit: ${criticalThreatRangeText} x${attackResult.criticalMultiplier}`;
	}

	getWeaponAttackBonus(ctx: AttackContext): number {
		const weapon = ctx.weapon;
		const weaponType = weapon.getWeaponType();
		const attackType = weaponType === WeaponType.MELEE ? "meleeAtk" : "rangedAtk";

		// BAB
		const baseAttackBonus = this.getBaseAttackBonus();
		// Ability modifier
		const abilityModifier = weapon.isFinesse()
			? Math.max(this.owner.stats.getAbilityScoreModifiers().strength, this.owner.stats.getAbilityScoreModifiers().dexterity)
			: this.owner.stats.getAbilityScoreModifiers().strength;

		let penalty = 0;
		if (ctx.isDualWielding) {
			penalty = ctx.isPrimary ? -6 : -10;
			if (ctx.offhandIsLight) {
				penalty += 2; // Light off-hand weapons reduce the dual-wielding penalty by 2
			}
		}

		// Modifiers from feats, equipment, buffs, etc.
		const modBonuses: number = modifierManager.getTotalModifier(attackType, this.owner, ctx) as number;
		return baseAttackBonus + abilityModifier + modBonuses + penalty;
	}

	calculateBaseDamage(dice: DamageDieInfo, ctx: AttackContext): number[] {
		const minDamage = dice.count; // Minimum damage is the number of dice (e.g. 2d6 has a minimum of 2)
		const maxDamage = dice.count * dice.type; // Maximum damage is the number of dice times the type (e.g. 2d6 has a maximum of 12)
		let bonusDamage = 0; // This will be calculated from ability modifiers, feats, equipment, etc.
		const attackType = ctx.weapon.getWeaponType() === WeaponType.MELEE ? "meleeDmg" : "rangedDmg";
		const modBonuses: number = modifierManager.getTotalModifier(attackType, this.owner, ctx) as number;
		bonusDamage += modBonuses;
		bonusDamage += this.getStrengthBasedDamageBonus(ctx); // Calculate strength-based damage bonus based on attack context
		const totalMinDamage = minDamage + bonusDamage;
		const totalMaxDamage = maxDamage + bonusDamage;
		return [totalMinDamage, totalMaxDamage]; // Return min and max damage for simplicity, can be changed to a random roll if desired
	}

	getStrengthBasedDamageBonus(ctx: AttackContext): number {
		const str: number = this.owner.stats.getAbilityScoreModifiers().strength;

		if (ctx.weapon.getWeaponType() === WeaponType.RANGED) {
			return ctx.weapon.isComposite() ? str : 0; // Composite bows add strength bonus to damage, regular ranged weapons do not
		}

		if (ctx.isOffHand) {
			return Math.floor(str / 2); // Off-hand attacks typically get half the strength bonus
		}

		if (ctx.heldInTwoHands) {
			return Math.floor(str * 1.5); // Two-handed attacks typically get 1.5 times the strength bonus
		}

		return str; // Normal strength bonus for one-handed attacks
	}

	handleDamageDieProgression(damage: DamageDieInfo): DamageDieInfo {
		// Default behavior
		const sizeCategory = this.owner.stats.getSizeCategory();
		if (sizeCategory < SizeCategory.MEDIUM) {
			// Weapon damage dice are reduced
			damage = DamageProgression.getPreviousDamage(damage);
		} else if (sizeCategory > SizeCategory.MEDIUM) {
			// Weapon damage dice are increased
			damage = DamageProgression.getNextDamage(damage, 2 * (sizeCategory - SizeCategory.MEDIUM)); // Increase damage by 2 steps for each size category above medium
		}
		return damage;
	}

	getAttackIterations(): CreatureFullAttackCount {
		const attackCount = {
			[AttackIteration.PRIMARY]: 0,
			[AttackIteration.OFFHAND]: 0,
			[AttackIteration.PRIMARY_FULL]: 0,
		};

		const bab = this.getBaseAttackBonus();
		const iterations = Math.max(Math.floor((bab - 1) / 5) + 1, 1); // One attack at BAB +0, and an additional attack for every 5 BAB
		console.log(`Base Attack Bonus: ${bab}, Primary Attacks: ${iterations}`);
		const offhand = this.owner.inventory.getWeaponInSlot(EquipmentSlot.OFFHAND);
		console.log(`Off-hand weapon: ${offhand ? offhand.getId() : "None"}`);
		if (offhand) {
			const maxOffhandIterations = modifierManager.getTotalModifier(AttackIteration.OFFHAND, this.owner, {}) as number;
			attackCount[AttackIteration.OFFHAND] = maxOffhandIterations + 1;
		}
		const primaryFullIterations = modifierManager.getTotalModifier(AttackIteration.PRIMARY_FULL, this.owner, {}) as number;
		attackCount[AttackIteration.PRIMARY_FULL] = primaryFullIterations;
		attackCount[AttackIteration.PRIMARY] = iterations;
		return attackCount;
	}

	getNumberOfAttacks(): number {
		const iterations = this.getAttackIterations();
		return iterations[AttackIteration.PRIMARY] + iterations[AttackIteration.OFFHAND] + iterations[AttackIteration.PRIMARY_FULL];
	}

	getInitiative(): number {
		return this.initiative;
	}

	getInitiativeBonus(): number {
		let base: number = this.owner.stats.getAbilityScoreModifiers().dexterity;
		const bonuses: number = modifierManager.getTotalModifier("initiative", this.owner, {}) as number;
		return base + bonuses;
	}

	rollInitiative(): number {
		const roll = DiceRoller.roll(Dice.d20)[0];
		const initiative = roll + this.getInitiativeBonus();
		this.initiative = initiative;
		console.log(`${this.owner.id} rolled initiative: ${roll} + ${this.getInitiativeBonus()} = ${initiative}`);
		return initiative;
	}

	hasRolledInitiative(): boolean {
		return this.initiative !== -Infinity; // Initiative is set to -Infinity by default, so if it's different, it means initiative has been rolled
	}

	resetInitiative(): void {
		this.initiative = -Infinity; // Reset initiative to default state
	}
}
