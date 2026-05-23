interface StatusEffectData {
	id: string;
	modifiers: Modifier[];
	remainingDuration?: number;
	onExpire?: (creature: Creature, ctx: any) => void; // Optional callback function to execute when the status effect expires
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
	AC = "ac",
	AC_DEX_BONUS = "acDexBonus",
}

enum Condition {
	PRONE = "prone",
	BLINDED = "blinded",
	STUNNED = "stunned",
	POISONED = "poisoned",
	CHARMED = "charmed",
	FEARED = "feared",
	FATIGUED = "fatigued",
	EXHAUSTED = "exhausted",
	FLAT_FOOTED = "flatFooted",
}

class StatusEffect implements IStatusEffect {
	id: string;
	owner: Creature | null;
	modifiers: Modifier[];
	remainingDuration: number; // Remaining duration in seconds
	onExpire?: (creature: Creature, ctx: any) => void;

	constructor(data: StatusEffectData) {
		this.id = data.id;
		this.modifiers = data.modifiers;
		this.remainingDuration = data.remainingDuration ?? 0;
		this.owner = data.owner ?? null;
		this.onExpire = data.onExpire ?? undefined;
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
	private effects: Map<string, StatusEffect> = new Map();

	addEffect(effect: StatusEffect) {
		console.log(`${DebugColor.GREEN}Adding status effect to manager: ${effect.id}`);
		this.effects.set(effect.getId(), new StatusEffect(effect));
	}

	getEffect(id: string): StatusEffect | undefined {
		console.log(`${DebugColor.BLUE}Retrieving status effect with ID: ${id}`);
		console.log(`Available status effects: ${Array.from(this.effects.keys()).join(", ")}`);
		return this.effects.get(id);
	}
}

const statusEffectManager = new StatusEffectManager();
