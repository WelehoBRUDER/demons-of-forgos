"use strict";
statusEffectManager.addEffect(new StatusEffect({
    id: "dashing",
    modifiers: [
        {
            id: "dashing_movement_bonus",
            target: CreatureModifiers.MOVEMENT_SPEED,
            operation: Operation.multiply,
            evaluate: (creature, ctx) => {
                return 1; // Double movement speed while dashing
            },
            type: ModifierType.untyped,
        },
    ],
}));
//# sourceMappingURL=status_effects.js.map