"use strict";
class CreatureStatusEffectManager {
    owner;
    effects = new Map();
    constructor(owner) {
        this.owner = owner;
    }
    addStatusEffect(effectId, duration) {
        const baseEffect = statusEffectManager.getEffect(effectId);
        console.log(`Adding status effect ${effectId} to creature ${this.owner.getUID()} with duration ${duration} seconds`);
        console.log(`Base effect details:`, baseEffect);
        if (baseEffect) {
            const effect = new StatusEffect({ ...baseEffect, remainingDuration: duration, owner: this.owner });
            this.effects.set(effectId, effect);
            this.owner.providersNeedUpdate = true;
            combatEvents.emit("statChanged", { creatureUID: this.owner.getUID() });
        }
    }
    hasCondition(condition) {
        const conditionCount = modifierManager.getTotalModifier(condition, this.owner, {});
        return conditionCount > 0;
    }
    getActiveEffects() {
        return Array.from(this.effects.values());
    }
    getProviders() {
        const providers = [];
        for (const effect of this.effects.values()) {
            providers.push(effect);
        }
        return providers;
    }
    updateEffects(dt) {
        for (const effect of this.effects.values()) {
            effect.update(dt);
        }
    }
    expire(effectId) {
        this.effects.delete(effectId);
        this.owner.providersNeedUpdate = true;
        combatEvents.emit("statChanged", { creatureUID: this.owner.getUID() });
    }
}
//# sourceMappingURL=creature_status_effects.js.map