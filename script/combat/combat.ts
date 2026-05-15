class CombatManager {
	participants: string[] = []; // Array of creature UIDs participating in combat, sorted by initiative order
	round: number = 0; // Current round of combat, can be used for tracking effects that last a certain number of rounds, etc.
	turnIndex: number = 0; // Index of the current creature's turn in the participants array, can be used to determine whose turn it is and to advance turns
	initiativeRow: HTMLDivElement;

	constructor() {
		this.initiativeRow = document.querySelector(".initiative-row") as HTMLDivElement;
	}

	startCombat(creatures: Creature[], ctx?: any) {
		this.round = ctx?.round ?? 1;
		this.turnIndex = ctx?.turnIndex ?? 0;
		this.initiativeRow.innerHTML = ""; // Clear previous initiative display
		creatures.map((creature) => {
			this.addToCombat(creature);
		});
		this.drawInitiativeOrder();
		this.getCurrentTurnCreature().ai.makeDecision(); // Trigger AI decision for the first creature in combat immediately
	}

	getCurrentTurnCreature(): Creature | undefined {
		const currentUID = this.participants[this.turnIndex];
		return entityManager.getCreatureByUID(currentUID);
	}

	nextTurn() {
		if (this.participants.length === 0) {
			return; // No participants in combat
		}
		this.turnIndex = (this.turnIndex + 1) % this.participants.length;
		if (this.turnIndex === 0) {
			this.round++; // Increment round when we loop back to the first participant
		}
		this.drawInitiativeOrder();
	}

	addToCombat(creature: Creature) {
		if (!this.participants.includes(creature.getUID())) {
			this.participants.push(creature.getUID());
			if (!creature.combat.hasRolledInitiative()) {
				creature.combat.rollInitiative();
			}
			creature.setPath([]); // Clear any existing path to prevent movement during combat
			this.sortParticipantsByInitiative();
		}
	}

	drawInitiativeOrder() {
		this.initiativeRow.innerHTML = "";
		this.participants.forEach((uid, index) => {
			const creature = entityManager.getCreatureByUID(uid);
			if (creature) {
				const initiativeEntry = document.createElement("div");
				const portraitImage = new PortraitImage(creature, 64, 64);
				initiativeEntry.classList.add("initiative-entry");
				initiativeEntry.classList.add(Faction[creature.stats.getFaction()].toLowerCase());
				if (index === this.turnIndex) {
					initiativeEntry.classList.add("active");
				}
				//initiativeEntry.textContent = `${creature.getTemplateId()} (Init: ${creature.combat.getInitiative()})`;
				initiativeEntry.appendChild(portraitImage.getCanvas());
				this.initiativeRow.appendChild(initiativeEntry);
			}
		});
	}

	hasParticipant(uid: string): boolean {
		return this.participants.includes(uid);
	}

	removeFromCombat(creature: Creature) {
		const index = this.participants.indexOf(creature.getUID());
		if (index !== -1) {
			this.participants.splice(index, 1);
		}
	}

	sortParticipantsByInitiative() {
		this.participants.sort((aUID, bUID) => {
			const a = entityManager.getCreatureByUID(aUID);
			const b = entityManager.getCreatureByUID(bUID);
			if (a && b) {
				return b.combat.getInitiative() - a.combat.getInitiative(); // Sort descending by initiative
			}
			return 0;
		});
		this.makeCameraFollowCurrentTurn();
	}

	makeCameraFollowCurrentTurn() {
		const currentUID = this.participants[this.turnIndex];
		const creature = entityManager.getCreatureByUID(currentUID);
		if (creature) {
			camera.setTracking(creature);
		}
	}

	isCreatureTurn(creature: Creature): boolean {
		const currentUID = this.participants[this.turnIndex];
		return creature.getUID() === currentUID;
	}
}

const combatManager = new CombatManager();
