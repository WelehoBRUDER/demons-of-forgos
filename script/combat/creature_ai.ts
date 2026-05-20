class CreatureAI {
	private owner: Creature;
	constructor(owner: Creature) {
		this.owner = owner;
	}

	async makeDecision(): Promise<void> {
		// Placeholder for AI decision-making logic
		// For now, just find nearest hostile creature and move towards it
		let hostiles: Creature[] = [];
		if (this.owner.stats.getFaction() !== Faction.HOSTILE) {
			hostiles = entityManager.getCreaturesByFaction(Faction.HOSTILE, { map: this.owner.getMap() });
		} else {
			hostiles = entityManager.getCreaturesByFaction(Faction.PLAYER, { map: this.owner.getMap() });
			hostiles = hostiles.concat(entityManager.getCreaturesByFaction(Faction.NEUTRAL, { map: this.owner.getMap() }));
			hostiles = hostiles.concat(entityManager.getCreaturesByFaction(Faction.FRIENDLY, { map: this.owner.getMap() }));
		}

		if (hostiles.length === 0) {
			return; // No hostiles to target
		}

		const attackRange: number = this.owner.combat.getAttackRange(this.owner.inventory.getEquippedItem(EquipmentSlot.WEAPON) as Weapon);

		let nearestHostile: Creature | null = null;
		let nearestDistance = Infinity;
		let bestPath: { x: number; y: number }[] = [];
		for (const hostile of hostiles) {
			const dist = pathfinder.heuristic({ x: this.owner.x, y: this.owner.y }, { x: hostile.x, y: hostile.y });
			if (dist < nearestDistance) {
				const path = pathfinder.AStar(
					{ x: this.owner.x, y: this.owner.y },
					[{ x: hostile.x, y: hostile.y }],
					mapManager.getMap(this.owner.getMap()),
					this.owner,
					attackRange,
					attackRange, // For now, treat preference the same as tolerance so it will prefer to stop at max attack range instead of trying to get closer
				);
				const pathCost = path ? pathfinder.totalPathCost(path) : Infinity;
				if (pathCost < nearestDistance) {
					bestPath = path;
					nearestDistance = dist;
					nearestHostile = hostile;
				}
			}
		}
		this.owner.setPath(bestPath);

		await this.owner.animationFinished(); // Wait for movement to finish before ending the turn

		await sleep(200); // Small delay before attacking

		if (pathfinder.heuristic({ x: this.owner.x, y: this.owner.y }, { x: nearestHostile!.x, y: nearestHostile!.y }) <= attackRange) {
			await this.owner.combat.attack(nearestHostile!, { x: nearestHostile!.x, y: nearestHostile!.y });
			//nearestHostile!.takeDamage(10); // Placeholder damage value
		}

		return new Promise((resolve) => {
			resolve();
		});
	}
}
