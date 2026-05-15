class CreatureStats implements ICreatureStats {
	owner: Creature;
	abilityScores: AbilityScores;
	faction: Faction;
	sizeCategory: SizeCategory;
	saves: Saves;
	hp: number;

	constructor(owner: Creature, stats: ICreatureStats) {
		this.owner = owner;
		this.abilityScores = stats.abilityScores
			? { ...stats.abilityScores }
			: {
					...defaultAbilityScores,
				};
		this.faction = stats.faction || Faction.NEUTRAL;
		this.sizeCategory = stats.sizeCategory || SizeCategory.MEDIUM;
		this.saves = stats.saves || { [Save.FORTITUDE]: 0, [Save.REFLEX]: 0, [Save.WILL]: 0 };

		if (stats.hp !== undefined) {
			this.hp = stats.hp;
		} else {
			this.resetHP(); // Ensure HP is set to max HP on initialization
		}
	}

	calcAbilityModifierFromScore(score: number): number {
		return Math.floor((score - 10) / 2);
	}

	getAbilityScores(): AbilityScores {
		const scores: AbilityScores = { ...this.abilityScores };
		for (const ability in scores) {
			const bonuses: number = modifierManager.getTotalModifier(ability, this.owner, {}) as number;
			scores[ability as keyof AbilityScores] += bonuses;
		}
		return scores;
	}

	getAbilityScoreModifiers(): AbilityScores {
		const scores = this.getAbilityScores();
		return {
			strength: this.calcAbilityModifierFromScore(scores.strength),
			dexterity: this.calcAbilityModifierFromScore(scores.dexterity),
			constitution: this.calcAbilityModifierFromScore(scores.constitution),
			intelligence: this.calcAbilityModifierFromScore(scores.intelligence),
			wisdom: this.calcAbilityModifierFromScore(scores.wisdom),
			charisma: this.calcAbilityModifierFromScore(scores.charisma),
		};
	}

	getSaves(): Saves {
		const saves: Saves = { ...this.saves };
		for (const save in saves) {
			const bonuses: number = modifierManager.getTotalModifier(save, this.owner, {}) as number;
			saves[save as keyof Saves] += bonuses;
		}
		return saves;
	}

	getSizeCategoryId(): string {
		return SizeCategory[this.sizeCategory];
	}

	getSizeCategory(): number {
		return this.sizeCategory;
	}

	getSizeProvider(): ModifierProvider {
		return Size.getProvider(this.sizeCategory);
	}

	getFaction(): Faction {
		return this.faction;
	}

	setFaction(faction: Faction) {
		this.faction = faction;
	}

	getMaxHP(): number {
		let base: number = 0;
		const flatBonus: number = modifierManager.getTotalModifier("hp", this.owner, {}) as number;
		const hitDieBonus: number = modifierManager.getTotalModifier("hp.per_hitDie", this.owner, {}) as number;
		const constitutionBonus: number = this.getAbilityScoreModifiers().constitution;
		const hitDice = this.owner.getHitDice();

		if (!hitDice) return 1;

		Object.values(hitDice).forEach((hitDieInfo) => {
			base += hitDieInfo.count * (hitDieInfo.type / 2 + 1); // Average roll of the hit die, e.g. D6 averages to 3.5, so (6/2)+1 = 4
			base += hitDieInfo.count * (hitDieBonus + constitutionBonus); // Add any per-hit-die bonuses
		});

		Math.floor(base);

		return base + flatBonus;
	}

	getHpPercentage(): number {
		return Math.max(0, this.hp / this.getMaxHP());
	}

	setHP(amount: number) {
		this.hp = amount;
		this.hp = Math.min(this.hp, this.getMaxHP()); // Ensure HP does not exceed max HP
	}

	resetHP() {
		this.setHP(this.getMaxHP());
	}

	getHP(): number {
		return this.hp;
	}

	getAC(): ArmorClass {
		let ac = 10;
		let touchAC = 10;
		let flatFootedAC = 10;
		const dexBonus = this.getAbilityScoreModifiers().dexterity;

		const limit: number = this.owner.dexToACLimit();

		ac += Math.min(dexBonus, limit);
		touchAC += Math.min(dexBonus, limit);

		const acBonuses = modifierManager.getTotalModifier("ac", this.owner, null, { groupedByType: true }) as GroupedModifiers;
		for (const modType in acBonuses) {
			const value = acBonuses[modType as ModifierType] || 0;
			if (modType === ModifierType.armor || modType === ModifierType.shield || modType === ModifierType.naturalArmor) {
				ac += value;
				flatFootedAC += value;
			} else {
				ac += value;
				touchAC += value;
				flatFootedAC += value;
			}
		}
		// Future: Add armor, shields, natural armor, magical effects, etc.
		return {
			full: ac,
			touch: touchAC,
			flatFooted: flatFootedAC,
		};
	}
}
