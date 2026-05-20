"use strict";
var CombatEventId;
(function (CombatEventId) {
    CombatEventId["TURN_STARTED"] = "turnStarted";
    CombatEventId["TURN_ENDED"] = "turnEnded";
    CombatEventId["ACTION_STARTED"] = "actionStarted";
    CombatEventId["STAT_CHANGED"] = "statChanged";
    CombatEventId["DAMAGE_TAKEN"] = "damageTaken";
    CombatEventId["CREATURE_DIED"] = "creatureDied";
    CombatEventId["COMBAT_ENDED"] = "combatEnded";
})(CombatEventId || (CombatEventId = {}));
class EventBus {
    listeners = {};
    on(event, handler) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(handler);
    }
    off(event, handler) {
        const handlers = this.listeners[event];
        if (!handlers)
            return;
        this.listeners[event] = handlers.filter((h) => h !== handler);
    }
    emit(event, payload) {
        const handlers = this.listeners[event];
        if (!handlers)
            return;
        handlers.forEach((handler) => handler(payload));
    }
    once(event, handler) {
        const wrapper = (payload) => {
            handler(payload);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
}
const combatEvents = new EventBus();
//# sourceMappingURL=combat_events.js.map