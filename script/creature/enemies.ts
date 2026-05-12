entityManager.addEnemyTemplate(
	new NPCCreature({
		id: "goblin",
		species: "goblin",
		spritePath: "assets/sprites/goblin.png",
		faction: Faction.HOSTILE,
		sizeCategory: SizeCategory.SMALL,
		abilityScores: {
			strength: 11,
			dexterity: 15,
			constitution: 12,
			intelligence: 10,
			wisdom: 9,
			charisma: 6,
		},
		baseHitDice: [{ type: HitDice.D10, count: 1 }],
		modifiers: [
			{
				id: "goblin_armor",
				target: "ac",
				operation: Operation.add,
				evaluate: () => 2,
				type: ModifierType.armor,
			},
			{
				id: "goblin_shield",
				target: "ac",
				operation: Operation.add,
				evaluate: () => 1,
				type: ModifierType.shield,
			},
		],
		feats: ["improved_initiative"],
		bab: 1,
	}),
);
entityManager.addEnemyTemplate(
	new NPCCreature({
		id: "ogre",
		species: "ogre",
		spritePath: "assets/sprites/ogre.png",
		faction: Faction.HOSTILE,
		sizeCategory: SizeCategory.LARGE,
		abilityScores: {
			strength: 21,
			dexterity: 8,
			constitution: 15,
			intelligence: 6,
			wisdom: 10,
			charisma: 7,
		},
		baseHitDice: [{ type: HitDice.D8, count: 4 }],
		modifiers: [
			{
				id: "ogre_natural_armor",
				target: "ac",
				operation: Operation.add,
				evaluate: () => 5,
				type: ModifierType.naturalArmor,
			},
			{
				id: "ogre_armor",
				target: "ac",
				operation: Operation.add,
				evaluate: () => 4,
				type: ModifierType.armor,
			},
		],
		feats: ["toughness"],
		bab: 3,
	}),
);
entityManager.addEnemyTemplate(
	new NPCCreature({
		id: "skeleton",
		species: "undead",
		spritePath: "assets/sprites/skeleton_warrior.png",
		faction: Faction.HOSTILE,
		sizeCategory: SizeCategory.MEDIUM,
		abilityScores: {
			strength: 15,
			dexterity: 14,
			constitution: 0,
			intelligence: 0,
			wisdom: 10,
			charisma: 10,
		},
		baseHitDice: [{ type: HitDice.D8, count: 1 }],
		modifiers: [
			{
				id: "skeleton_armor",
				target: "ac",
				operation: Operation.add,
				evaluate: () => 2,
				type: ModifierType.armor,
			},
			{
				id: "skeleton_natural_armor",
				target: "ac",
				operation: Operation.add,
				evaluate: () => 2,
				type: ModifierType.naturalArmor,
			},
		],
		feats: ["improved_initiative"],
		bab: 0,
	}),
);
