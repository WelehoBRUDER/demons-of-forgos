class CreatureTurnController {
	owner: Creature;

	constructor(owner: Creature) {
		this.owner = owner;
	}

	async beginTurn(): Promise<void> {
		this.owner.combat.resetActions();

		return new Promise((resolve) => {
			// Simulate turn processing time (e.g., for animations, effects, etc.)
			setTimeout(() => {
				resolve();
			}, 100); // Adjust the delay as needed
		});
	}

	async endTurn(): Promise<void> {}
}
