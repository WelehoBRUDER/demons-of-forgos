statusEffectManager.addEffect(
	new StatusEffect({
		id: "dashing",
		modifiers: [
			{
				id: "dashing_movement_bonus",
				target: CreatureModifiers.MOVEMENT_SPEED,
				operation: Operation.multiply,
				evaluate: (creature: Creature, ctx: any) => {
					return 1; // Double movement speed while dashing
				},
				type: ModifierType.untyped,
			},
		],
	}),
);
statusEffectManager.addEffect(
	new StatusEffect({
		id: "prone",
		modifiers: [
			{
				id: "prone_melee_attack_vulnerability",
				target: AttackBonusType.MELEE_PENALTY_ATTACKER,
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					return 4; // +4 to melee attack rolls against prone target
				},
				type: ModifierType.untyped,
			},
			{
				id: "prone_ranged_attack_defense",
				target: AttackBonusType.RANGED_PENALTY_ATTACKER,
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					return -4; // -4 to ranged attack rolls against prone target
				},
				type: ModifierType.untyped,
			},
			{
				id: "prone_condition",
				target: Condition.PRONE,
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					return 1; // Apply prone condition
				},
				type: ModifierType.untyped,
			},
		],
		onExpire: (creature: Creature) => {
			creature.combat.provokeOpportunityAttacks(); // Provokes opportunity attacks when standing up from prone
		},
	}),
);
statusEffectManager.addEffect(
	new StatusEffect({
		id: "blinded",
		modifiers: [
			{
				id: "blinded_ac_penalty",
				target: CreatureModifiers.AC,
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					return -2; // -2 to AC while blinded
				},
				type: ModifierType.untyped,
			},
			{
				id: "blinded_dex_to_ac_penalty",
				target: CreatureModifiers.AC_DEX_BONUS,
				operation: Operation.override,
				evaluate: (creature: Creature, ctx: any) => {
					return 0; // No Dexterity bonus to AC while blinded
				},
				type: ModifierType.untyped,
			},
			{
				id: "blinded_condition",
				target: Condition.BLINDED,
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					return 1; // Apply blinded condition
				},
				type: ModifierType.untyped,
			},
		],
	}),
);
statusEffectManager.addEffect(
	new StatusEffect({
		id: "flatFooted",
		modifiers: [
			{
				id: "flatFooted_opportunity_attacks_disabled",
				target: AttackBonusType.OPPORTUNITY_ATTACK_COUNT,
				operation: Operation.multiply,
				evaluate: (creature: Creature, ctx: any) => {
					if (ctx.immuneToOpportunityAttackDisable) {
						return 0;
					}
					return -1; // flat-footed creatures cannot make opportunity attacks
				},
				type: ModifierType.untyped,
			},
			{
				id: "flatFooted_condition",
				target: Condition.FLAT_FOOTED,
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					return 1; // Apply flat-footed condition
				},
				type: ModifierType.untyped,
			},
		],
	}),
);
statusEffectManager.addEffect(
	new StatusEffect({
		id: "haste",
		modifiers: [
			{
				id: "haste_movement_bonus",
				target: CreatureModifiers.MOVEMENT_SPEED,
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					return 6; // Flat +6 tiles of movement speed while hasted
				},
				type: ModifierType.enhancement,
			},
			{
				id: "haste_ac_bonus",
				target: CreatureModifiers.AC,
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					return 1; // Flat +1 to AC while hasted
				},
				type: ModifierType.dodge,
			},
			{
				id: "haste_reflex_bonus",
				target: Save.REFLEX,
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					return 1; // Flat +1 to Reflex save while hasted
				},
				type: ModifierType.dodge,
			},
			{
				id: "haste_attack_bonus",
				target: AttackBonusType.WEAPON,
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					return 1; // Flat +1 to attack rolls while hasted
				},
				type: ModifierType.untyped,
			},
			{
				id: "haste_attack_iteration_bonus",
				target: AttackIteration.PRIMARY_FULL,
				operation: Operation.add,
				evaluate: (creature: Creature, ctx: any) => {
					return 1; // Extra primary attack at full BAB while hasted
				},
				type: ModifierType.enhancement, // Prevent stacking with speed weapon or similar effects that also grant extra attacks at full BAB
			},
		],
	}),
);
