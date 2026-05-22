"use strict";
var StandardDuration;
(function (StandardDuration) {
    StandardDuration[StandardDuration["ROUND"] = 6] = "ROUND";
    StandardDuration[StandardDuration["MINUTE"] = 60] = "MINUTE";
    StandardDuration[StandardDuration["HOUR"] = 3600] = "HOUR";
    StandardDuration[StandardDuration["DAY"] = 86400] = "DAY";
})(StandardDuration || (StandardDuration = {}));
var CreatureModifiers;
(function (CreatureModifiers) {
    CreatureModifiers["MOVEMENT_SPEED"] = "movementSpeed";
})(CreatureModifiers || (CreatureModifiers = {}));
class StatusEffect {
    id;
    owner;
    modifiers;
    remainingDuration; // Remaining duration in seconds
    constructor(data) {
        this.id = data.id;
        this.modifiers = data.modifiers;
        this.remainingDuration = data.remainingDuration ?? 0;
        this.owner = data.owner ?? null;
    }
    getId() {
        return this.id;
    }
    getModifiers(creature, ctx) {
        return this.modifiers;
    }
    getRemainingDuration() {
        return this.remainingDuration;
    }
    update(dt) {
        this.remainingDuration -= dt;
        if (this.remainingDuration <= 0) {
            this.expire();
        }
    }
    expire() {
        if (this.owner) {
            this.owner.statusEffects.expire(this.id);
        }
    }
}
class StatusEffectManager {
    effects = new Map();
    addEffect(effect) {
        this.effects.set(effect.getId(), new StatusEffect(effect));
    }
    getEffect(id) {
        return this.effects.get(id);
    }
}
const statusEffectManager = new StatusEffectManager();
//# sourceMappingURL=status_effect.js.map