"use strict";
var WeaponType;
(function (WeaponType) {
    WeaponType["MELEE"] = "melee";
    WeaponType["RANGED"] = "ranged";
})(WeaponType || (WeaponType = {}));
var DamageType;
(function (DamageType) {
    DamageType["SLASHING"] = "slashing";
    DamageType["PIERCING"] = "piercing";
    DamageType["BLUDGEONING"] = "bludgeoning";
    DamageType["FIRE"] = "fire";
    DamageType["COLD"] = "cold";
    DamageType["LIGHTNING"] = "lightning";
    DamageType["ACID"] = "acid";
    DamageType["POISON"] = "poison";
    DamageType["FORCE"] = "force";
    DamageType["SONIC"] = "sonic";
    DamageType["PRECISION"] = "precision";
    DamageType["DIVINE"] = "divine";
})(DamageType || (DamageType = {}));
var DamageDiceProgression;
(function (DamageDiceProgression) {
    DamageDiceProgression[DamageDiceProgression["1d2"] = 0] = "1d2";
    DamageDiceProgression[DamageDiceProgression["1d3"] = 1] = "1d3";
    DamageDiceProgression[DamageDiceProgression["1d4"] = 2] = "1d4";
    DamageDiceProgression[DamageDiceProgression["1d6"] = 3] = "1d6";
    DamageDiceProgression[DamageDiceProgression["1d8"] = 4] = "1d8";
    DamageDiceProgression[DamageDiceProgression["1d10"] = 5] = "1d10";
    DamageDiceProgression[DamageDiceProgression["2d6"] = 6] = "2d6";
    DamageDiceProgression[DamageDiceProgression["2d8"] = 7] = "2d8";
    DamageDiceProgression[DamageDiceProgression["3d6"] = 8] = "3d6";
    DamageDiceProgression[DamageDiceProgression["3d8"] = 9] = "3d8";
    DamageDiceProgression[DamageDiceProgression["4d6"] = 10] = "4d6";
    DamageDiceProgression[DamageDiceProgression["4d8"] = 11] = "4d8";
    DamageDiceProgression[DamageDiceProgression["6d6"] = 12] = "6d6";
    DamageDiceProgression[DamageDiceProgression["6d8"] = 13] = "6d8";
    DamageDiceProgression[DamageDiceProgression["8d6"] = 14] = "8d6";
    DamageDiceProgression[DamageDiceProgression["8d8"] = 15] = "8d8";
    DamageDiceProgression[DamageDiceProgression["12d6"] = 16] = "12d6";
    DamageDiceProgression[DamageDiceProgression["12d8"] = 17] = "12d8";
    DamageDiceProgression[DamageDiceProgression["16d6"] = 18] = "16d6";
})(DamageDiceProgression || (DamageDiceProgression = {}));
class DamageProgression {
    static getNextDamage(damage, step = 1) {
        const key = DamageProgression.damageObjectToKey(damage);
        const progression = Object.values(DamageDiceProgression);
        const index = progression.indexOf(key);
        if (index >= 0 && index < progression.length - step) {
            // @ts-ignore
            return DamageProgression.damageKeyToObject(progression[index + step]);
        }
        else {
            throw new Error(`Damage ${key} is not in the progression or is already at max`);
        }
    }
    static getPreviousDamage(damage, step = 1) {
        const key = DamageProgression.damageObjectToKey(damage);
        const progression = Object.values(DamageDiceProgression);
        const index = progression.indexOf(key);
        if (index > 0 && index >= step) {
            // @ts-ignore
            return DamageProgression.damageKeyToObject(progression[index - step]);
        }
        else {
            throw new Error(`Damage ${key} is not in the progression or is already at minimum`);
        }
    }
    static standardizeDice(damage) {
        if (damage.type === Dice.d4) {
            if (damage.count % 2 === 0) {
                return { count: damage.count / 2, type: Dice.d8 };
            }
            else {
                return { count: Math.floor(damage.count * (2 / 3)), type: Dice.d6 };
            }
        }
        if (damage.type === Dice.d12) {
            return { count: damage.count * 2, type: Dice.d6 };
        }
    }
    static damageObjectToKey(damage) {
        return `${damage.count}d${damage.type}`;
    }
    static damageKeyToObject(key) {
        const match = key.match(/(\d+)d(\d+)/);
        if (match) {
            return { count: parseInt(match[1]), type: parseInt(match[2]) };
        }
        else {
            throw new Error(`Invalid damage key: ${key}`);
        }
    }
}
class Weapon extends Equipment {
    damage;
    weaponType;
    damageType;
    critRange;
    critMultiplier;
    finesse;
    light;
    heavy;
    enhancementBonus;
    constructor(data) {
        super(data);
        this.type = "Weapon";
        this.anchorPoint = data.anchorPoint || AnchorPointType.weapon; // Default to "weapon" anchor point if not specified
        this.damage = data.damage;
        this.weaponType = data.weaponType;
        this.damageType = data.damageType || DamageType.SLASHING; // Default damage type is slashing if not specified
        this.enhancementBonus = data.enhancementBonus || 0;
        this.critRange = data.critRange || 20; // Default critical hit range is 20 (only a natural 20 is a crit)
        this.critMultiplier = data.critMultiplier || 2; // Default critical hit damage multiplier is 2 (double damage)
        this.finesse = data.finesse || false;
        this.light = data.light || false;
        this.heavy = data.heavy || false;
    }
    getDamage() {
        return this.damage;
    }
    getWeaponType() {
        return this.weaponType;
    }
    isFinesse() {
        return this.finesse;
    }
    isLight() {
        return this.light;
    }
    isHeavy() {
        return this.heavy;
    }
    getEnhancementBonus() {
        return this.enhancementBonus;
    }
    getDamageType() {
        return this.damageType;
    }
    getModifiers(ctx) {
        return [];
    }
}
//# sourceMappingURL=weapon.js.map