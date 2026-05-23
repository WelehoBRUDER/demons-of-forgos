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
    CreatureModifiers["AC"] = "ac";
    CreatureModifiers["AC_DEX_BONUS"] = "acDexBonus";
    CreatureModifiers["COMBAT_MANEUVER_BONUS"] = "combatManeuverBonus";
    CreatureModifiers["COMBAT_MANEUVER_DEFENSE"] = "combatManeuverDefense";
})(CreatureModifiers || (CreatureModifiers = {}));
var Condition;
(function (Condition) {
    Condition["PRONE"] = "prone";
    Condition["BLINDED"] = "blinded";
    Condition["STUNNED"] = "stunned";
    Condition["POISONED"] = "poisoned";
    Condition["CHARMED"] = "charmed";
    Condition["FEARED"] = "feared";
    Condition["FATIGUED"] = "fatigued";
    Condition["EXHAUSTED"] = "exhausted";
    Condition["FLAT_FOOTED"] = "flatFooted";
})(Condition || (Condition = {}));
class StatusEffect {
    id;
    owner;
    modifiers;
    remainingDuration; // Remaining duration in seconds
    onExpire;
    constructor(data) {
        this.id = data.id;
        this.modifiers = data.modifiers;
        this.remainingDuration = data.remainingDuration ?? 0;
        this.owner = data.owner ?? null;
        this.onExpire = data.onExpire ?? undefined;
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
        console.log(`Updating status effect ${this.id}, remaining duration: ${this.remainingDuration.toFixed(2)} seconds`);
        if (this.remainingDuration <= 0) {
            this.expire();
        }
    }
    expire() {
        if (this.owner) {
            this.owner.statusEffects.expire(this.id);
        }
        if (this.onExpire) {
            this.onExpire(this.owner, {});
        }
    }
}
class StatusEffectManager {
    effects = new Map();
    addEffect(effect) {
        console.log(`${DebugColor.GREEN}Adding status effect to manager: ${effect.id}`);
        this.effects.set(effect.getId(), new StatusEffect(effect));
    }
    getEffect(id) {
        console.log(`${DebugColor.BLUE}Retrieving status effect with ID: ${id}`);
        console.log(`Available status effects: ${Array.from(this.effects.keys()).join(", ")}`);
        return this.effects.get(id);
    }
}
const statusEffectManager = new StatusEffectManager();
//# sourceMappingURL=status_effect.js.map