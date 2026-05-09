"use strict";
class EffectManager {
    effects = new Map();
    addEffect(effect) {
        const id = generateUID("effect", effect);
        this.effects.set(id, effect);
    }
    updateEffects(dt) {
        for (const [id, effect] of this.effects) {
            effect.update(dt);
            if (effect.isExpired()) {
                this.effects.delete(id);
            }
        }
    }
    renderEffects() {
        mapRenderer.clearEffectLayer();
        for (const effect of this.effects.values()) {
            effect.render(mapRenderer.getEffectContext());
        }
    }
}
const effectManager = new EffectManager();
//# sourceMappingURL=effect_manager.js.map