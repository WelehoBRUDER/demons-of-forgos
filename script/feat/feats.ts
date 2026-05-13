featManager.addFeat(
	new Feat({
		id: "toughness",
		modifiers: [
			{
				id: "toughness_hp_modifier",
				target: "hp",
				operation: Operation.add,
				evaluate: (creature: Creature) => {
					return creature.getHitDiceTotalCount();
				},
				type: ModifierType.untyped,
			},
		],
	}),
);
featManager.addFeat(
	new Feat({
		id: "improved_initiative",
		modifiers: [
			{
				id: "improved_initiative_modifier",
				target: "initiative",
				operation: Operation.add,
				evaluate: () => 4,
				type: ModifierType.untyped,
			},
		],
	}),
);
featManager.addFeat(
	new Feat({
		id: "power_attack",
		modifiers: [
			{
				id: "power_attack_penalty",
				target: "meleeAtk",
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					const bab = creature.getBaseAttackBonus();
					return -(1 + Math.floor(bab / 4)); // -1 attack penalty for every 4 BAB
				},
				type: ModifierType.untyped,
			},
			{
				id: "power_attack_damage",
				target: "meleeDmg",
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					const bab = creature.getBaseAttackBonus();
					const bonusDamage = 2 + Math.floor(bab / 4) * 2; // +2 damage for every 4 BAB
					// Add logic for two-handing and off-handing since they affect the damage bonus, but for treat everything as usual
					console.log("Power Attack Bonus Damage:", bonusDamage, "Context:", ctx);
					if (ctx.heldInTwoHands) {
						return Math.floor(bonusDamage * 1.5);
					}
					if (ctx.isOffHand) {
						return Math.floor(bonusDamage / 2);
					}
					return bonusDamage;
				},
				type: ModifierType.untyped,
			},
		],
	}),
);
