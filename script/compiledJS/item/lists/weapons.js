"use strict";
itemManager.addItem(new Weapon({
    id: "unarmed_strike",
    spritePath: "assets/items/weapons/unarmed_strike.png",
    damage: { count: 1, type: Dice.d3 },
    weaponType: WeaponType.MELEE,
    damageType: DamageType.BLUDGEONING,
    light: true,
}));
itemManager.addItem(new Weapon({
    id: "longsword",
    spritePath: "assets/items/weapons/longsword.png",
    damage: { count: 1, type: Dice.d8 },
    weaponType: WeaponType.MELEE,
    damageType: DamageType.SLASHING,
}));
itemManager.addItem(new Weapon({
    id: "dagger",
    spritePath: "assets/items/weapons/longsword.png",
    damage: { count: 1, type: Dice.d4 },
    weaponType: WeaponType.MELEE,
    damageType: DamageType.PIERCING,
    finesse: true,
    light: true,
    critRange: 19,
}));
itemManager.addItem(new Weapon({
    id: "shortsword",
    spritePath: "assets/items/weapons/longsword.png",
    damage: { count: 1, type: Dice.d6 },
    weaponType: WeaponType.MELEE,
    damageType: DamageType.PIERCING,
    light: true,
    critRange: 19,
}));
itemManager.addItem(new Weapon({
    id: "greatsword",
    spritePath: "assets/items/weapons/longsword.png",
    damage: { count: 2, type: Dice.d6 },
    weaponType: WeaponType.MELEE,
    damageType: DamageType.SLASHING,
    heavy: true,
}));
//# sourceMappingURL=weapons.js.map