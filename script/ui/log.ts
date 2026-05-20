type CombatEvent = keyof CombatEvents;

interface BaseEvent {
	id: number;
	timestamp: number;
	type: CombatEvent;
}

class CombatLog {
	private events: BaseEvent[] = [];
}

const combatLog = new CombatLog();
