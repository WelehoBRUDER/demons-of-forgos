class EffectManager {
	effects: Map<string, Effect> = new Map();

	addEffect(effect: Effect) {
		const id = generateUID("effect", effect);
		this.effects.set(id, effect);
	}

	updateEffects(dt: number) {
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
