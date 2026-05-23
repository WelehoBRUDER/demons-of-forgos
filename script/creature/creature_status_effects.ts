class CreatureStatusEffectManager {
	owner: Creature;
	effects: Map<string, StatusEffect> = new Map();

	constructor(owner: Creature) {
		this.owner = owner;
	}

	addStatusEffect(effectId: string, duration: number) {
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

	hasCondition(condition: Condition): boolean {
		const conditionCount = modifierManager.getTotalModifier(condition, this.owner, {}) as number;
		return conditionCount > 0;
	}

	getActiveEffects(): StatusEffect[] {
		return Array.from(this.effects.values());
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
