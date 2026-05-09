entityManager.addEnemyTemplate(
	new NPCCreature({ id: "goblin", species: "goblin", spritePath: "assets/sprites/goblin.png", faction: HOSTILE, sizeCategory: "small" }),
);
entityManager.addEnemyTemplate(
	new NPCCreature({ id: "ogre", species: "ogre", spritePath: "assets/sprites/ogre.png", faction: HOSTILE, sizeCategory: "large" }),
);
entityManager.addEnemyTemplate(
	new NPCCreature({
		id: "skeleton",
		species: "undead",
		spritePath: "assets/sprites/skeleton_warrior.png",
		faction: HOSTILE,
		sizeCategory: "medium",
	}),
);
