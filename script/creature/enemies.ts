entityManager.addEnemyTemplate(
	new NPCCreature({
		id: "goblin",
		species: "goblin",
		spritePath: "assets/sprites/goblin.png",
		faction: Faction.HOSTILE,
		sizeCategory: SizeCategory.SMALL,
	}),
);
entityManager.addEnemyTemplate(
	new NPCCreature({
		id: "ogre",
		species: "ogre",
		spritePath: "assets/sprites/ogre.png",
		faction: Faction.HOSTILE,
		sizeCategory: SizeCategory.LARGE,
	}),
);
entityManager.addEnemyTemplate(
	new NPCCreature({
		id: "skeleton",
		species: "undead",
		spritePath: "assets/sprites/skeleton_warrior.png",
		faction: Faction.HOSTILE,
		sizeCategory: SizeCategory.MEDIUM,
	}),
);
