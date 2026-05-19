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

	async endTurn(): Promise<void> {
		await this.owner.movementFollowPath(); // Ensure any movement along a path is completed at the start of the turn
		return new Promise((resolve) => {
			// Simulate end-of-turn processing time (e.g., for animations, effects, etc.)
			setTimeout(() => {
				resolve();
			}, 100); // Adjust the delay as needed
		});
	}

	awaitPlayerInput(): Promise<void> {
		return new Promise((resolve) => {
			const checkForInput = () => {
				if (this.owner.combat.hasPerformedAction()) {
					resolve();
				} else {
					requestAnimationFrame(checkForInput);
				}
			};
			checkForInput();
		});
	}
}
