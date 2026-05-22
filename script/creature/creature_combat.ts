class CreatureCombat implements ICreatureCombat {
	owner: Creature;
	bab: number;
	initiative: number;
	actions: Actions;
	turnEnd: boolean; // This is used by the player to indicate they have finished their turn
	movement: number = 0;

	constructor(owner: Creature, combatData: ICreatureCombat) {
		this.owner = owner;
		this.bab = combatData?.bab || 0;
		this.initiative = combatData?.initiative || -Infinity; // -Infinity means initiative has not been rolled yet
		this.actions = combatData?.actions || {
			[Action.STANDARD]: 1,
			[Action.MOVE]: 1,
			[Action.FULL_ROUND]: 1,
			[Action.SWIFT]: 1,
		};
		this.turnEnd = false; // This is used by the player
		this.movement = this.owner.getMoveSpeed();
	}

	getAttackRange(weapon: Weapon): number {
		const weaponRange: number = weapon.getRange();
		if (weapon.getWeaponType() === WeaponType.RANGED) {
			return weaponRange;
		}
		const bonusRange = modifierManager.getTotalModifier(AttackBonusType.MELEE_REACH, this.owner, {}) as number;
		return weaponRange + bonusRange;
	}

	getThreatRange(): number {
		const ctx = this.owner.inventory.getEquippedWeapons()[0]; // If dual wielding: both weapons will have equal range. If using reach weapon: can't dual wield.
		return ctx.weapon.getWeaponType() === WeaponType.MELEE ? this.getAttackRange(ctx.weapon) : 0; // Ranged weapons don't threaten, so return 0 for ranged attacks
	}

	getBaseAttackBonus(): number {
		return this.bab; // This should be calculated based on class levels for player characters or set as a static value for enemies
	}

	buildAttack(ctx: AttackContext, targetCreature?: Creature): AttackResult {
		const weapon = ctx.weapon;

		if (targetCreature) {
			ctx.targetCreature = targetCreature;
			ctx.canBeFlanked = targetCreature.combat.canBeFlanked();
		}

		const damageDice = this.handleDamageDieProgression(weapon.getDamage());

		const attackBonus = this.getWeaponAttackBonus(ctx);

		const [damageMin, damageMax] = this.calculateBaseDamage(damageDice, ctx);

		const critRange = weapon.getCritRange();
		const critMultiplier = weapon.getCritMultiplier();

		console.log(
			`BUILDING ATTACK: Weapon: ${weapon.getId()}, Attack Bonus: ${attackBonus}, Damage: ${damageMin}-${damageMax} ${weapon.getDamageType()}, Crit Range: ${critRange}-20, Crit Multiplier: x${critMultiplier} | CREATURE: ${this.owner.getUID()}`,
		);

		return {
			weapon,
			attackBonus,
			attackRange: this.getAttackRange(weapon),
			damageMin,
			damageMax,
			damageType: weapon.getDamageType(),
			criticalThreatRange: critRange,
			criticalMultiplier: critMultiplier,
		};
	}

	hasPerformedAction() {
		return false;
	}

	hasEndedTurn() {
		return this.turnEnd;
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
		const attackType = weaponType === WeaponType.MELEE ? AttackBonusType.MELEE : AttackBonusType.RANGED;
		const abilityModifiers = this.owner.stats.getAbilityScoreModifiers();

		// BAB
		const baseAttackBonus = this.getBaseAttackBonus();
		// Ability modifier
		let abilityModifier: number = abilityModifiers.strength; // Default to strength for melee attacks

		if (attackType === AttackBonusType.RANGED) {
			abilityModifier = abilityModifiers.dexterity; // Dexterity is used for ranged attacks
		} else if (weapon.isFinesse()) {
			abilityModifier = Math.max(abilityModifiers.strength, abilityModifiers.dexterity);
		}

		const penalties: string[] = [
			attackType + "_PENALTY_ATTACKER",
			AttackBonusType.ATTACK_PENALTY_ATTACKER,
			AttackBonusType.WEAPON_PENALTY_ATTACKER,
		];
		const penaltyFromTarget: number = ctx.targetCreature
			? (modifierManager.getTotalModifierFromMultipleSources(penalties, ctx.targetCreature, ctx) as number)
			: 0;

		// Modifiers from feats, equipment, buffs, etc.
		const modBonuses: number = modifierManager.getTotalModifier(attackType, this.owner, ctx) as number;
		const weaponBonuses: number = modifierManager.getTotalModifier(AttackBonusType.WEAPON, this.owner, ctx) as number;

		console.log(
			"WEAPON BONUSES",
			modifierManager.getTotalModifier(AttackBonusType.WEAPON, this.owner, ctx, { groupedByType: true }) as number,
		);
		console.log(`---------------- CREATURE ${this.owner.getUID()} ATTACK CALCULATION ----------------`);
		console.log("IS DUAL WIELDING:", ctx.isDualWielding);
		console.log(`Attack Type: ${attackType}, Base Attack Bonus: ${baseAttackBonus}, Ability Modifier: ${abilityModifier}`);
		console.log(`Modifiers: ${modBonuses} (from feats, equipment, buffs, etc.)`);
		console.log(`Weapon Bonuses: ${weaponBonuses}`);
		console.log(`Penalty from Target: ${penaltyFromTarget}`);
		return baseAttackBonus + abilityModifier + modBonuses + weaponBonuses + penaltyFromTarget;
	}

	calculateBaseDamage(dice: DamageDieInfo, ctx: AttackContext): number[] {
		const minDamage = dice.count; // Minimum damage is the number of dice (e.g. 2d6 has a minimum of 2)
		const maxDamage = dice.count * dice.type; // Maximum damage is the number of dice times the type (e.g. 2d6 has a maximum of 12)
		let bonusDamage = 0; // This will be calculated from ability modifiers, feats, equipment, etc.
		const attackType = ctx.weapon.getWeaponType() === WeaponType.MELEE ? AttackBonusType.MELEE_DAMAGE : AttackBonusType.RANGED_DAMAGE;
		const modBonuses: number = modifierManager.getTotalModifier(attackType, this.owner, ctx) as number;
		const weaponBonuses: number = modifierManager.getTotalModifier(AttackBonusType.WEAPON_DAMAGE, this.owner, ctx) as number;
		bonusDamage += modBonuses;
		bonusDamage += weaponBonuses;
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

	canBeFlanked(): boolean {
		return !modifierManager.getTotalModifier("cannotBeFlanked", this.owner, {}) && this.owner.stats.isAlive();
	}

	rollInitiative(): number {
		const roll = DiceRoller.roll(Dice.d20)[0];
		const initiative = roll + this.getInitiativeBonus();
		this.initiative = initiative;
		const { x, y } = this.owner.getScreenPosition();
		const { x: visualOffsetX, y: visualOffsetY } = this.owner.getVisualOffset();
		effectManager.addEffect(new CustomFloatingText(`${initiative}`, x + visualOffsetX, y + visualOffsetY, 32, "yellow", 3000, 75));
		return initiative;
	}

	hasRolledInitiative(): boolean {
		return this.initiative !== -Infinity; // Initiative is set to -Infinity by default, so if it's different, it means initiative has been rolled
	}

	resetInitiative(): void {
		this.initiative = -Infinity; // Reset initiative to default state
	}

	applyMovementCost(cost: number): void {
		this.movement -= cost;
		if (this.owner.getMoveSpeed() - this.movement > 1 && this.actions[Action.MOVE] > 0) {
			this.spendAction(Action.MOVE); // If the creature has moved more than 1 cell, it has used its move action for the turn
		}
		if (this.movement < 0 && this.actions[Action.STANDARD] > 0) {
			this.movement += this.owner.getMoveSpeed();
			this.spendAction(Action.STANDARD); // The creature must dash if it tries to move beyond its movement speed, which means it cannot take a standard action after moving its full movement
		}
		combatEvents.emit(CombatEventId.STAT_CHANGED, { creatureUID: this.owner.getUID() }); // Emit stat changed event to update UI
	}

	resetActions(): void {
		this.actions = {
			[Action.STANDARD]: 1,
			[Action.MOVE]: 1,
			[Action.FULL_ROUND]: 1,
			[Action.SWIFT]: 1,
		};
		this.movement = this.owner.getMoveSpeed();
		combatEvents.emit(CombatEventId.STAT_CHANGED, { creatureUID: this.owner.getUID() }); // Emit stat changed event to update UI
		this.turnEnd = false; // Reset turn end status at the start of the turn
	}

	spendAction(actionType: Action): void {
		if (this.actions[actionType] > 0) {
			this.actions[actionType]--;

			if (actionType === Action.FULL_ROUND) {
				this.actions[Action.STANDARD] = 0;
				this.actions[Action.MOVE] = 0;
				this.movement = Math.min(this.movement, 1); // If a full-round action is taken, movement is set to 1 and move action is lost
			} else if (actionType !== Action.SWIFT) {
				this.actions[Action.FULL_ROUND] = 0;
			}

			combatEvents.emit(CombatEventId.STAT_CHANGED, { creatureUID: this.owner.getUID() }); // Emit stat changed event to update UI
		}
	}

	async attack(target: Creature, tile: { x: number; y: number }) {
		if (this.actions[Action.FULL_ROUND] > 0) {
			this.spendAction(Action.FULL_ROUND);
			const attackIterations = this.getAttackIterations();

			for (let i = 0; i < attackIterations[AttackIteration.PRIMARY]; i++) {
				if (!target) break;
				const ctx = this.owner.inventory.getEquippedWeapons()[0]; // Assuming the first equipped weapon is the primary weapon, this can be improved by checking which weapon is actually being used for the attack
				await this.owner.playMeleeAttackAnimation(target, tile, ctx);
				if (!this.checkIfAttackTargetValid(target)) {
					target = this.findNearestHostileWithinRange(this.getAttackRange(ctx.weapon) || 1); // If the original target is no longer valid (e.g. killed by a previous attack), find a new target within range
					tile = { x: target?.x, y: target?.y }; // Update the target tile to the new target's position
				}
			}

			for (let i = 0; i < attackIterations[AttackIteration.PRIMARY_FULL]; i++) {
				if (!target) break;
				const ctx = this.owner.inventory.getEquippedWeapons()[0]; // Assuming the first equipped weapon is the primary weapon, this can be improved by checking which weapon is actually being used for the attack
				await this.owner.playMeleeAttackAnimation(target, tile, ctx);
				if (!this.checkIfAttackTargetValid(target)) {
					target = this.findNearestHostileWithinRange(this.getAttackRange(ctx.weapon) || 1); // If the original target is no longer valid (e.g. killed by a previous attack), find a new target within range
					tile = { x: target?.x, y: target?.y }; // Update the target tile to the new target's position
				}
			}

			for (let i = 0; i < attackIterations[AttackIteration.OFFHAND]; i++) {
				if (!target) break;
				const ctx = this.owner.inventory.getEquippedWeapons()[1]; // Assuming the second equipped weapon is the off-hand weapon, this can be improved by checking which weapon is actually being used for the attack
				await this.owner.playMeleeAttackAnimation(target, tile, ctx);
				if (!this.checkIfAttackTargetValid(target)) {
					target = this.findNearestHostileWithinRange(this.getAttackRange(ctx.weapon) || 1); // If the original target is no longer valid (e.g. killed by a previous attack), find a new target within range
					tile = { x: target?.x, y: target?.y }; // Update the target tile to the new target's position
				}
			}
		} else if (this.actions[Action.STANDARD] > 0) {
			this.spendAction(Action.STANDARD);
			const ctx = this.owner.inventory.getEquippedWeapons()[0]; // Assuming the first equipped weapon is the primary weapon, this can be improved by checking which weapon is actually being used for the attack
			await this.owner.playMeleeAttackAnimation(target, tile, ctx);
		}
	}

	checkIfAttackTargetValid(target: Creature): boolean {
		return target !== null && target !== undefined && target.stats.isAlive();
	}

	findNearestHostileWithinRange(range: number): Creature | null {
		const hostiles = entityManager.getCreaturesByFaction(this.owner.stats.getHostileFactions(), { map: this.owner.getMap() });

		if (hostiles.length === 0) {
			return null; // No hostiles to target
		}

		let nearestHostile: Creature | null = null;
		let nearestDistance = Infinity;
		for (const hostile of hostiles) {
			if (!hostile.stats.isAlive()) continue; // Skip dead hostiles
			const dist = pathfinder.heuristic({ x: this.owner.x, y: this.owner.y }, { x: hostile.x, y: hostile.y });
			if (dist < nearestDistance && dist <= range) {
				nearestDistance = dist;
				nearestHostile = hostile;
			}
		}
		return nearestHostile;
	}

	executeAttack(target: Creature, ctx: AttackContext) {
		const attackResult: AttackResult = this.buildAttack(ctx, target);
		const attackRollResult: AttackRollResult = DiceRoller.attackRoll(this.owner, target, attackResult);
		console.log(
			`Attack made! Roll: ${attackRollResult.attackRoll}, Total: ${attackRollResult.totalRoll}, Target AC: ${target.stats.getAC().full}`,
		);

		const randomVariance = DiceRoller.rollBetween(-40, 40); // Add some random variance to the screen position of the floating text to prevent it from stacking perfectly when multiple attacks hit at the same time

		if (attackRollResult.isHit) {
			const damage: number = DiceRoller.rollBetween(attackResult.damageMin, attackResult.damageMax);
			console.log(`Attack hits! Dealing ${damage} ${attackResult.damageType} damage.`);
			target.takeDamage(damage);
			effectManager.addEffect(
				new CustomFloatingText(`Hit! -${damage}`, target.screenX + randomVariance, target.screenY + randomVariance, 24, "red", 1500, 50),
			);
		} else {
			effectManager.addEffect(
				new CustomFloatingText("Miss!", target.screenX + randomVariance, target.screenY + randomVariance, 24, "gold", 1500, 50),
			);
			return;
		}
	}
}
