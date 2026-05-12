itemManager.addItem(
	new Weapon({
		id: "longsword",
		spritePath: "assets/items/weapons/longsword.png",
		damage: { count: 1, type: Dice.d8 },
		weaponType: WeaponType.MELEE,
	}),
);
itemManager.addItem(
	new Weapon({
		id: "dagger",
		spritePath: "assets/items/weapons/longsword.png",
		damage: { count: 1, type: Dice.d4 },
		weaponType: WeaponType.MELEE,
		finesse: true,
		light: true,
	}),
);
itemManager.addItem(
	new Weapon({
		id: "greatsword",
		spritePath: "assets/items/weapons/longsword.png",
		damage: { count: 2, type: Dice.d6 },
		weaponType: WeaponType.MELEE,
		heavy: true,
	}),
);
