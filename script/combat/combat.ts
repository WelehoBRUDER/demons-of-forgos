class CombatManager {
	participants: string[] = []; // Array of creature UIDs participating in combat, sorted by initiative order
	round: number = 0; // Current round of combat, can be used for tracking effects that last a certain number of rounds, etc.
	turnIndex: number = 0; // Index of the current creature's turn in the participants array, can be used to determine whose turn it is and to advance turns

	constructor() {}

	startCombat(creatures: Creature[], ctx?: any) {
		this.round = ctx?.round ?? 1;
		this.turnIndex = ctx?.turnIndex ?? 0;
		creatures.map((creature) => {
			this.addToCombat(creature);
		});
	}

	addToCombat(creature: Creature) {
		if (!this.participants.includes(creature.getUID())) {
			this.participants.push(creature.getUID());
			if (!creature.combat.hasRolledInitiative()) {
				creature.combat.rollInitiative();
			}
			this.sortParticipantsByInitiative();
		}
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
	}

	isCreatureTurn(creature: Creature): boolean {
		const currentUID = this.participants[this.turnIndex];
		return creature.getUID() === currentUID;
	}
}

const combatManager = new CombatManager();
