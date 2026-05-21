"use strict";
featManager.addFeat(new Feat({
    id: "toughness",
    modifiers: [
        {
            id: "toughness_hp_modifier",
            target: "hp",
            operation: Operation.add,
            evaluate: (creature) => {
                return creature.getHitDiceTotalCount();
            },
            type: ModifierType.untyped,
        },
    ],
}));
featManager.addFeat(new Feat({
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
}));
featManager.addFeat(new Feat({
    id: "power_attack",
    modifiers: [
        {
            id: "power_attack_penalty",
            target: AttackBonusType.MELEE,
            operation: Operation.add,
            evaluate: (creature, ctx) => {
                const bab = creature.combat.getBaseAttackBonus();
                return -(1 + Math.floor(bab / 4)); // -1 attack penalty for every 4 BAB
            },
            type: ModifierType.untyped,
        },
        {
            id: "power_attack_damage",
            target: AttackBonusType.MELEE_DAMAGE,
            operation: Operation.add,
            evaluate: (creature, ctx) => {
                const bab = creature.combat.getBaseAttackBonus();
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
}));
featManager.addFeat(new Feat({
    id: "two_weapon_fighting",
    modifiers: [
        {
            id: "two_weapon_fighting_bonus",
            target: AttackBonusType.MELEE,
            operation: Operation.add,
            evaluate: (creature, ctx) => {
                if (ctx.isDualWielding) {
                    if (ctx.isOffHand) {
                        return 6; // +6 to off-hand attacks
                    }
                    return 2; // +2 to main-hand attacks when dual-wielding
                }
                return 0;
            },
            type: ModifierType.untyped,
        },
    ],
}));
featManager.addFeat(new Feat({
    id: "improved_two_weapon_fighting",
    modifiers: [
        {
            id: "improved_two_weapon_fighting_bonus",
            target: AttackIteration.OFFHAND,
            operation: Operation.add,
            evaluate: (creature, ctx) => {
                if (ctx.isDualWielding) {
                    return 1; // Extra off-hand attack iteration
                }
                return 0;
            },
            type: ModifierType.untyped,
        },
    ],
}));
featManager.addFeat(new Feat({
    id: "greater_two_weapon_fighting",
    modifiers: [
        {
            id: "greater_two_weapon_fighting_bonus",
            target: AttackIteration.OFFHAND,
            operation: Operation.add,
            evaluate: (creature, ctx) => {
                if (ctx.isDualWielding) {
                    return 1; // Extra off-hand attack iteration
                }
                return 0;
            },
            type: ModifierType.untyped,
        },
    ],
}));
featManager.addFeat(new Feat({
    id: "weapon_focus",
    requiredParams: ["weapon"],
    modifiers: [
        {
            id: "weapon_focus_bonus",
            target: AttackBonusType.WEAPON,
            operation: Operation.add,
            evaluate: (creature, ctx) => {
                if (ctx.weapon && ctx.weapon.getId() === creature.getFeatParams("weapon_focus")?.weapon) {
                    return 1;
                }
                return 0;
            },
            type: ModifierType.untyped,
        },
    ],
}));
//# sourceMappingURL=feats.js.map