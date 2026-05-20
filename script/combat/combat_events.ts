type CombatEvents = {
	turnStarted: {
		creatureUID: string;
		round: number;
	};

	turnEnded: {
		creatureUID: string;
	};

	actionStarted: {
		actionId: string;
		creatureUID: string;
	};

	statChanged: {
		creatureUID: string; // just triggers ui updates
	};

	damageTaken: {
		sourceUID: string;
		targetUID: string;
		amount: number;
	};

	creatureDied: {
		creatureUID: string;
	};

	combatEnded: {
		winningFaction: Faction;
	};
};

enum CombatEventId {
	TURN_STARTED = "turnStarted",
	TURN_ENDED = "turnEnded",
	ACTION_STARTED = "actionStarted",
	STAT_CHANGED = "statChanged",
	DAMAGE_TAKEN = "damageTaken",
	CREATURE_DIED = "creatureDied",
	COMBAT_ENDED = "combatEnded",
}

class EventBus<TEvents extends Record<string, any>> {
	private listeners: { [K in keyof TEvents]?: ((payload: TEvents[K]) => void)[] } = {};

	on<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void) {
		if (!this.listeners[event]) {
			this.listeners[event] = [];
		}

		this.listeners[event]!.push(handler);
	}

	off<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void) {
		const handlers = this.listeners[event]!;
		if (!handlers) return;
		this.listeners[event] = handlers.filter((h) => h !== handler);
	}

	emit<K extends keyof TEvents>(event: K, payload: TEvents[K]) {
		const handlers = this.listeners[event];
		if (!handlers) return;
		handlers.forEach((handler) => handler(payload));
	}

	once<K extends keyof TEvents>(event: K, handler: (payload: TEvents[K]) => void) {
		const wrapper = (payload: TEvents[K]) => {
			handler(payload);
			this.off(event, wrapper);
		};
		this.on(event, wrapper);
	}
}

const combatEvents: EventBus<CombatEvents> = new EventBus<CombatEvents>();
