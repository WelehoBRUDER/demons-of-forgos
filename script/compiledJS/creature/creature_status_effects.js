"use strict";
class CreatureStatusEffectManager {
    owner;
    effects = new Map();
    constructor(owner) {
        this.owner = owner;
    }
    addStatusEffect(effectId, duration) {
        const baseEffect = statusEffectManager.getEffect(effectId);
        if (baseEffect) {
            const effect = new StatusEffect({ ...baseEffect, remainingDuration: duration, owner: this.owner });
            this.effects.set(effectId, effect);
            this.owner.providersNeedUpdate = true;
        }
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
    }
}
//# sourceMappingURL=creature_status_effects.js.map