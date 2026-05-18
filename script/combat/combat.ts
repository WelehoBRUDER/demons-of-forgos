enum TurnState {
	Idle,
	StartingTurn,
	AwaitingInput,
	ExecutingAction,
	ResolvingEffects,
	EndingTurn,
}

class TurnContext {
	uid: string;
	state: TurnState = TurnState.Idle;
	hasEnded: boolean = false;
	pendingActions: any[] = []; // This can be further typed based on the structure of actions in your game

	constructor(uid: string) {
		this.uid = uid;
	}
}

class CombatParticipant {
	uid: string;
	initiative: number;
	faction: Faction;
	isAlive: boolean;
	hasActed: boolean = false;
	delayed: boolean = false; // For actions that delay the participant's turn

	constructor(uid: string, initiative: number, faction: Faction, isAlive: boolean = true) {
		this.uid = uid;
		this.initiative = initiative;
		this.faction = faction;
		this.isAlive = isAlive;
	}
}

class CombatManager {
	initiativeOrder: CombatParticipant[] = []; // Array of creature UIDs participating in combat, sorted by initiative order
	round: number = 0; // Current round of combat, can be used for tracking effects that last a certain number of rounds, etc.
	activeTurnContext: TurnContext | null = null; // Context for the currently active turn, can be used to track state and pending actions for the current creature's turn
	initiativeRow: HTMLDivElement;

	constructor() {
		this.initiativeRow = document.querySelector(".initiative-row") as HTMLDivElement;
	}

	startCombat(creatures: Creature[], ctx?: any) {
		this.round = ctx?.round ?? 1;
		this.activeTurnContext = null;
		this.initiativeRow.innerHTML = ""; // Clear previous initiative display
		creatures.map((creature) => {
			this.addToCombat(creature);
		});
		this.activeTurnContext = new TurnContext(this.initiativeOrder[0].uid); // Set active turn context to the first creature in initiative order
		this.drawInitiativeOrder();
		//this.getCurrentTurnCreature().ai.makeDecision(); // Trigger AI decision for the first creature in combat immediately
		this.startTurn(); // Start the first turn immediately after setting up combat
	}

	async startTurn() {
		const creature = this.getCurrentTurnCreature();

		await creature.turn.beginTurn();

		if (creature.isAI()) {
			await creature.ai.makeDecision();
		} else {
		}

		await creature.turn.endTurn();

		this.advanceTurn();
	}

	advanceTurn() {
		if (this.initiativeOrder.length === 0) {
			return; // No participants in combat
		}

		const index: number = this.initiativeOrder.findIndex((p) => p.uid === this.getCurrentTurnCreature()?.getUID());
		this.activeTurnContext = null; // Clear active turn context to reset state for the next turn

		const nextIndex = (index + 1) % this.initiativeOrder.length;
		if (nextIndex === 0) {
			this.round++; // Increment round when we loop back to the first participant
		}

		this.activeTurnContext = new TurnContext(this.initiativeOrder[nextIndex].uid); // Set active turn context for the next creature's turn
		this.startTurn(); // Start the next turn immediately after advancing
	}

	getCurrentTurnCreature(): Creature | undefined {
		const currentUID = this.activeTurnContext ? this.activeTurnContext.uid : null;
		return entityManager.getCreatureByUID(currentUID);
	}

	// nextTurn() {
	// 	if (this.participants.length === 0) {
	// 		return; // No participants in combat
	// 	}
	// 	this.turnIndex = (this.turnIndex + 1) % this.participants.length;
	// 	if (this.turnIndex === 0) {
	// 		this.round++; // Increment round when we loop back to the first participant
	// 	}
	// 	this.drawInitiativeOrder();
	// }

	addToCombat(creature: Creature) {
		if (!this.initiativeOrder.some((p) => p.uid === creature.getUID())) {
			if (!creature.combat.hasRolledInitiative()) {
				creature.combat.rollInitiative();
			}
			const participant = new CombatParticipant(
				creature.getUID(),
				creature.combat.getInitiative(),
				creature.stats.getFaction(),
				creature.stats.isAlive(),
			);
			this.initiativeOrder.push(participant);
			creature.setPath([]); // Clear any existing path to prevent movement during combat
			this.sortParticipantsByInitiative();
		}
	}

	drawInitiativeOrder() {
		this.initiativeRow.innerHTML = "";
		this.initiativeOrder.forEach((ctx, index) => {
			const creature = entityManager.getCreatureByUID(ctx.uid);
			if (creature) {
				const initiativeEntry = document.createElement("div");
				const portraitImage = new PortraitImage(creature, 64, 64);
				initiativeEntry.classList.add("initiative-entry");
				initiativeEntry.classList.add(Faction[creature.stats.getFaction()].toLowerCase());
				if (ctx.uid === this.activeTurnContext?.uid) {
					initiativeEntry.classList.add("active");
				}
				//initiativeEntry.textContent = `${creature.getTemplateId()} (Init: ${creature.combat.getInitiative()})`;
				initiativeEntry.appendChild(portraitImage.getCanvas());
				this.initiativeRow.appendChild(initiativeEntry);
			}
		});
	}

	hasParticipant(uid: string): boolean {
		return this.initiativeOrder.some((p) => p.uid === uid);
	}

	removeFromCombat(creature: Creature) {
		const index = this.initiativeOrder.findIndex((p) => p.uid === creature.getUID());
		if (index !== -1) {
			this.initiativeOrder.splice(index, 1);
		}
	}

	sortParticipantsByInitiative() {
		this.initiativeOrder.sort((a, b) => {
			if (a && b) {
				return b.initiative - a.initiative; // Sort descending by initiative
			}
			return 0;
		});
		this.makeCameraFollowCurrentTurn();
	}

	makeCameraFollowCurrentTurn() {
		const creature = this.getCurrentTurnCreature();
		if (creature) {
			camera.setTracking(creature);
		}
	}

	isCreatureTurn(creature: Creature): boolean {
		const currentUID = this.getCurrentTurnCreature()?.getUID();
		return creature.getUID() === currentUID;
	}
}

const combatManager = new CombatManager();
