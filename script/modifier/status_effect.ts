interface StatusEffectData {
	id: string;
	modifiers: Modifier[];
	remainingDuration?: number;
	owner?: Creature; // Optional reference to the creature that has this status effect, can be set when the effect is applied to a creature
}

interface IStatusEffect extends ModifierProvider {
	id: string;
	modifiers: Modifier[];
	remainingDuration: number;
	update(dt: number): void;
	expire(): void;
}

enum StandardDuration {
	ROUND = 6,
	MINUTE = 60,
	HOUR = 3600,
	DAY = 86400,
}

enum CreatureModifiers {
	MOVEMENT_SPEED = "movementSpeed",
}

class StatusEffect implements IStatusEffect {
	id: string;
	owner: Creature | null;
	modifiers: Modifier[];
	remainingDuration: number; // Remaining duration in seconds

	constructor(data: StatusEffectData) {
		this.id = data.id;
		this.modifiers = data.modifiers;
		this.remainingDuration = data.remainingDuration ?? 0;
		this.owner = data.owner ?? null;
	}

	getId(): string {
		return this.id;
	}

	getModifiers(creature: Creature, ctx: any): Modifier[] {
		return this.modifiers;
	}

	getRemainingDuration(): number {
		return this.remainingDuration;
	}

	update(dt: number) {
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
	private effects: Map<string, StatusEffect> = new Map();

	addEffect(effect: StatusEffect) {
		this.effects.set(effect.getId(), new StatusEffect(effect));
	}

	getEffect(id: string): StatusEffect | undefined {
		return this.effects.get(id);
	}
}

const statusEffectManager = new StatusEffectManager();
