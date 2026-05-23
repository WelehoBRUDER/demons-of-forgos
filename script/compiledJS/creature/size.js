"use strict";
var SizeCategory;
(function (SizeCategory) {
    SizeCategory[SizeCategory["TINY"] = 0.5] = "TINY";
    SizeCategory[SizeCategory["SMALL"] = 0.75] = "SMALL";
    SizeCategory[SizeCategory["MEDIUM"] = 1] = "MEDIUM";
    SizeCategory[SizeCategory["LARGE"] = 2] = "LARGE";
    SizeCategory[SizeCategory["HUGE"] = 3] = "HUGE";
    SizeCategory[SizeCategory["GARGANTUAN"] = 4] = "GARGANTUAN";
})(SizeCategory || (SizeCategory = {}));
const sizeCategoryModifiers = {
    TINY: [
        {
            id: "tiny_size_modifier",
            target: "ac",
            operation: Operation.add,
            evaluate: () => 2,
            type: ModifierType.size,
        },
        {
            id: "tiny_size_modifier",
            target: AttackBonusType.MELEE,
            operation: Operation.add,
            evaluate: () => 2,
            type: ModifierType.size,
        },
        {
            id: "tiny_size_modifier_cmb",
            target: CreatureModifiers.COMBAT_MANEUVER_BONUS,
            operation: Operation.add,
            evaluate: () => -2, // Grant -2 to combat maneuver bonus for tiny creatures
            type: ModifierType.size,
        },
        {
            id: "tiny_size_modifier_cmd",
            target: CreatureModifiers.COMBAT_MANEUVER_DEFENSE,
            operation: Operation.add,
            evaluate: () => -2, // Grant -2 to combat maneuver defense for tiny creatures
            type: ModifierType.size,
        },
    ],
    SMALL: [
        {
            id: "small_size_modifier",
            target: "ac",
            operation: Operation.add,
            evaluate: () => 1,
            type: ModifierType.size,
        },
        {
            id: "small_size_modifier",
            target: AttackBonusType.MELEE,
            operation: Operation.add,
            evaluate: () => 1,
            type: ModifierType.size,
        },
        {
            id: "small_size_modifier_cmb",
            target: CreatureModifiers.COMBAT_MANEUVER_BONUS,
            operation: Operation.add,
            evaluate: () => -1, // Grant -1 to combat maneuver bonus for small creatures
            type: ModifierType.size,
        },
        {
            id: "small_size_modifier_cmd",
            target: CreatureModifiers.COMBAT_MANEUVER_DEFENSE,
            operation: Operation.add,
            evaluate: () => -1, // Grant -1 to combat maneuver defense for small creatures
            type: ModifierType.size,
        },
    ],
    MEDIUM: [
        {
            id: "medium_size_modifier",
            target: "ac",
            operation: Operation.add,
            evaluate: () => 0,
            type: ModifierType.size,
        },
    ],
    LARGE: [
        {
            id: "large_size_modifier",
            target: "ac",
            operation: Operation.add,
            evaluate: () => -1,
            type: ModifierType.size,
        },
        {
            id: "large_size_modifier",
            target: AttackBonusType.MELEE,
            operation: Operation.add,
            evaluate: () => -1,
            type: ModifierType.size,
        },
        {
            id: "large_size_modifier_reach",
            target: AttackBonusType.MELEE_REACH,
            operation: Operation.add,
            evaluate: () => 1, // Grant 1 cell of reach for large creatures
            type: ModifierType.size,
        },
        {
            id: "large_size_modifier_cmb",
            target: CreatureModifiers.COMBAT_MANEUVER_BONUS,
            operation: Operation.add,
            evaluate: () => 1, // Grant 1 to combat maneuver bonus for large creatures
            type: ModifierType.size,
        },
        {
            id: "large_size_modifier_cmd",
            target: CreatureModifiers.COMBAT_MANEUVER_DEFENSE,
            operation: Operation.add,
            evaluate: () => 1, // Grant 1 to combat maneuver defense for large creatures
            type: ModifierType.size,
        },
    ],
    HUGE: [
        {
            id: "huge_size_modifier",
            target: "ac",
            operation: Operation.add,
            evaluate: () => -2,
            type: ModifierType.size,
        },
        {
            id: "huge_size_modifier",
            target: AttackBonusType.MELEE,
            operation: Operation.add,
            evaluate: () => -2,
            type: ModifierType.size,
        },
        {
            id: "huge_size_modifier_reach",
            target: AttackBonusType.MELEE_REACH,
            operation: Operation.add,
            evaluate: () => 2, // Grant 2 cells of reach for huge creatures
            type: ModifierType.size,
        },
        {
            id: "huge_size_modifier_cmb",
            target: CreatureModifiers.COMBAT_MANEUVER_BONUS,
            operation: Operation.add,
            evaluate: () => 2, // Grant 2 to combat maneuver bonus for huge creatures
            type: ModifierType.size,
        },
        {
            id: "huge_size_modifier_cmd",
            target: CreatureModifiers.COMBAT_MANEUVER_DEFENSE,
            operation: Operation.add,
            evaluate: () => 2, // Grant 2 to combat maneuver defense for huge creatures
            type: ModifierType.size,
        },
    ],
    GARGANTUAN: [
        {
            id: "gargantuan_size_modifier",
            target: "ac",
            operation: Operation.add,
            evaluate: () => -4,
            type: ModifierType.size,
        },
        {
            id: "gargantuan_size_modifier",
            target: AttackBonusType.MELEE,
            operation: Operation.add,
            evaluate: () => -4,
            type: ModifierType.size,
        },
        {
            id: "gargantuan_size_modifier_reach",
            target: AttackBonusType.MELEE_REACH,
            operation: Operation.add,
            evaluate: () => 3, // Grant 3 cells of reach for gargantuan creatures
            type: ModifierType.size,
        },
        {
            id: "gargantuan_size_modifier_cmb",
            target: CreatureModifiers.COMBAT_MANEUVER_BONUS,
            operation: Operation.add,
            evaluate: () => 4, // Grant 4 to combat maneuver bonus for gargantuan creatures
            type: ModifierType.size,
        },
        {
            id: "gargantuan_size_modifier_cmd",
            target: CreatureModifiers.COMBAT_MANEUVER_DEFENSE,
            operation: Operation.add,
            evaluate: () => 4, // Grant 4 to combat maneuver defense for gargantuan creatures
            type: ModifierType.size,
        },
    ],
};
class Size {
    static getSizeMultiplier(sizeCategory) {
        return sizeCategory;
    }
    static getProvider(sizeCategory) {
        return new SizeProvider(sizeCategory);
    }
    static getMinSizeCategory() {
        return SizeCategory.TINY;
    }
    static getMaxSizeCategory() {
        return SizeCategory.GARGANTUAN;
    }
}
class SizeProvider {
    size;
    constructor(size) {
        this.size = size;
    }
    getModifiers() {
        const key = SizeCategory[this.size];
        return sizeCategoryModifiers[key];
    }
}
//# sourceMappingURL=size.js.map