class CreatureStatusEffectManager {
	owner: Creature;
	effects: Map<string, StatusEffect> = new Map();

	constructor(owner: Creature) {
		this.owner = owner;
	}

	addStatusEffect(effectId: string, duration: number) {
		const baseEffect = statusEffectManager.getEffect(effectId);
		if (baseEffect) {
			const effect = new StatusEffect({ ...baseEffect, remainingDuration: duration, owner: this.owner });
			this.effects.set(effectId, effect);
			this.owner.providersNeedUpdate = true;
			combatEvents.emit("statChanged", { creatureUID: this.owner.getUID() });
		}
	}

	getProviders(): ModifierProvider[] {
		const providers: ModifierProvider[] = [];
		for (const effect of this.effects.values()) {
			providers.push(effect);
		}
		return providers;
	}

	updateEffects(dt: number) {
		for (const effect of this.effects.values()) {
			effect.update(dt);
		}
	}

	expire(effectId: string) {
		this.effects.delete(effectId);
		this.owner.providersNeedUpdate = true;
		combatEvents.emit("statChanged", { creatureUID: this.owner.getUID() });
	}
}
