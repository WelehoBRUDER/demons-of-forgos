class Pathfinding {
	constructor() {}

	// A* pathfinding algorithm
	AStar(
		start: { x: number; y: number },
		goal: { x: number; y: number }[],
		map: WorldMap,
		creature: Creature,
		adjacencyTolerance: number = 1, // If the creature can't reach the goal directly, allow it to path to a tile adjacent to the goal within this tolerance
		adjacencyPreference: number = 0, // If same as tolerance, essentially means "prefer to stop immediately at tolerance limit" instead of going as close as possible
	): { x: number; y: number; cost: number }[] | null {
		if (!map.inBounds(start.x, start.y) || !map.inBounds(goal[0].x, goal[0].y)) {
			return [];
		}

		const path: { x: number; y: number; cost: number }[] = [];
		const openSet = new Set<string>();
		const closedSet = new Set<string>();
		const cameFrom = new Map<string, string>();
		const gScore = new Map<string, number>();
		const fScore = new Map<string, number>();
		const enterCost = new Map<string, number>();
		const size = creature.stats.getSizeCategory();

		const expandedGoals = this.findExpandedGoalNodes(goal, map, creature, adjacencyTolerance, adjacencyPreference);
		if (expandedGoals.length === 0) {
			return [];
		}
		const goalKeys = new Set(expandedGoals.map((g) => `${g.x},${g.y}`));

		const startKey = `${start.x},${start.y}`;
		//const goalKey = `${goal.x},${goal.y}`;
		openSet.add(startKey);
		gScore.set(startKey, 0);
		fScore.set(startKey, this.closestGoalHeuristic(start, expandedGoals));

		const MAXIMUM_ITERATIONS = 10 ** 4; // Safety limit to prevent infinite loops
		let iterationCount = 0;
		while (openSet.size > 0) {
			iterationCount++;
			if (iterationCount > MAXIMUM_ITERATIONS) {
				console.warn("Maximum iterations reached in A* pathfinding");
				return [];
			}
			// Get the node in openSet with the lowest fScore
			let currentKey: string | null = null;
			let lowestFScore = Infinity;
			for (const key of openSet) {
				const score = fScore.get(key) ?? Infinity;
				if (score < lowestFScore) {
					lowestFScore = score;
					currentKey = key;
				} else if (score === lowestFScore) {
					// If there's a tie in fScore, prefer the node with the lower gScore (closer to start)
					const currentGScore = gScore.get(currentKey) ?? Infinity;
					const keyGScore = gScore.get(key) ?? Infinity;
					if (keyGScore < currentGScore) {
						currentKey = key;
					}
				}
			}
			if (!currentKey) break;

			const [currentX, currentY] = currentKey.split(",").map(Number);
			if (goalKeys.has(currentKey)) {
				// Reconstruct path
				let key = currentKey;
				while (key) {
					const [x, y] = key.split(",").map(Number);
					path.unshift({ x, y, cost: enterCost.get(key) ?? 0 });
					key = cameFrom.get(key) || "";
				}
				return path;
			}

			closedSet.add(currentKey);
			openSet.delete(currentKey);

			const diagonalMoves = ["1,1", "1,-1", "-1,1", "-1,-1"];
			// Explore neighbors (including diagonals)
			for (let dx = -1; dx <= 1; dx++) {
				for (let dy = -1; dy <= 1; dy++) {
					if (dx === 0 && dy === 0) continue; // Skip the current node
					//if (diagonalMoves.includes(`${dx},${dy}`)) continue; // just for testing animations

					const costMultiplier = diagonalMoves.includes(`${dx},${dy}`) ? 1.414 : 1;

					const neighborX = currentX + dx;
					const neighborY = currentY + dy;
					const neighborKey = `${neighborX},${neighborY}`;
					if (!map.inBounds(neighborX, neighborY)) continue; // Skip out of bounds
					if (closedSet.has(neighborKey)) continue; // Skip already evaluated nodes

					const cost = this.costToEnter(neighborX, neighborY, map, creature, size);
					if (cost === Infinity) continue; // Skip impassable tiles

					const tentativeGScore = (gScore.get(currentKey) ?? Infinity) + cost * costMultiplier;
					if (tentativeGScore < (gScore.get(neighborKey) ?? Infinity)) {
						cameFrom.set(neighborKey, currentKey);
						gScore.set(neighborKey, tentativeGScore);
						fScore.set(neighborKey, tentativeGScore + this.closestGoalHeuristic({ x: neighborX, y: neighborY }, expandedGoals));
						enterCost.set(neighborKey, cost);

						if (!openSet.has(neighborKey)) {
							openSet.add(neighborKey);
						}
					}
				}
			}
		}
		return path;
	}

	findExpandedGoalNodes(
		goal: { x: number; y: number }[],
		map: WorldMap,
		creature: Creature,
		adjacencyTolerance: number,
		adjacencyPreference: number = 0,
	): { x: number; y: number }[] {
		const size = creature.stats.getSizeCategory();
		const expandedGoals: { x: number; y: number }[] = [];
		for (const g of goal) {
			for (let dx = -adjacencyTolerance; dx <= adjacencyTolerance; dx++) {
				for (let dy = -adjacencyTolerance; dy <= adjacencyTolerance; dy++) {
					const expandedX = g.x + dx;
					const expandedY = g.y + dy;
					if (!map.inBounds(expandedX, expandedY)) continue;

					const dist = Math.max(Math.abs(dx), Math.abs(dy));
					if (dist > adjacencyTolerance) continue; // Outside of tolerance radius
					if (dist < adjacencyPreference) continue; // Outside of preference radius
					if (this.costToEnter(expandedX, expandedY, map, creature, size) === Infinity) continue;
					expandedGoals.push({ x: expandedX, y: expandedY });
				}
			}
		}
		return expandedGoals;
	}

	heuristic(a: { x: number; y: number }, b: { x: number; y: number }): number {
		// Diagonal distance heuristic
		const dx = Math.abs(a.x - b.x);
		const dy = Math.abs(a.y - b.y);
		return Math.max(dx, dy);
	}

	closestGoalHeuristic(node: { x: number; y: number }, goals: { x: number; y: number }[]): number {
		let closestDistance = Infinity;
		for (const goal of goals) {
			const distance = this.heuristic(node, goal);
			if (distance < closestDistance) {
				closestDistance = distance;
			}
		}
		return closestDistance;
	}

	// Returns the movement cost to enter a tile, considering terrain and entities. Returns Infinity if the tile is impassable.
	costToEnter(tx: number, ty: number, map: WorldMap, creature: Creature, size: number): number {
		if (!map) return Infinity;
		if (size > map.getClearanceAt(tx, ty)) return Infinity; // Tile cannot accommodate the creature's size

		const propertyInteractions = creature.getTilePropertyInteractions();

		if (size == SizeCategory.SMALL) size = SizeCategory.MEDIUM; // Treat small and medium creatures the same

		let cost: number = 0;
		for (let dx = 0; dx < size; dx++) {
			for (let dy = 0; dy < size; dy++) {
				const x = tx + dx;
				const y = ty + dy;
				const terrainCost = this.costFromTerrain(x, y, map, propertyInteractions);
				if (terrainCost === Infinity) return Infinity; // If any tile in the occupied area is impassable, the whole area is impassable

				const objectCost = this.costFromObjects(x, y, map, propertyInteractions);
				if (objectCost === Infinity) return Infinity; // If any tile in the occupied area is impassable due to an object, the whole area is impassable

				const entityCost = this.costFromEntities(x, y, map, creature);
				if (entityCost === Infinity) return Infinity; // If any tile in the occupied area is blocked by an entity, the whole area is impassable

				cost = Math.max(cost, terrainCost, entityCost, objectCost); // Use the highest cost among the tiles in the occupied area to ensure we account for difficult terrain and entities properly
				tilesChecked++;
			}
		}

		return cost;
	}

	costFromObjects(x: number, y: number, map: WorldMap, interactions: TilePropertyInteractions): number {
		const objects = map.getBoundingObjectsAt(x, y);
		for (const obj of objects) {
			const properties: TileFlags = obj.getTileProperties();

			if (properties.isWall) return Infinity; // Impassable wall (static obstacle)
			if (properties.isWater && interactions.isWater === MovementType.BLOCKED) return Infinity; // Impassable water (can be flown/hovered or walked over)
			if (properties.isLowWall && interactions.isLowWall === MovementType.BLOCKED) return Infinity; // Impassable low wall (can be flown over but not hovered)
			if (properties.isDrop && interactions.isDrop === MovementType.BLOCKED) return Infinity; // Impassable drop (can be flown or hovered over)
			if (properties.isDifficultTerrain && interactions.isDifficultTerrain === MovementType.BLOCKED) return 2; // Difficult terrain, double movement cost

			return 1; // Normal movement cost
		}
		return 1; // No objects, normal movement cost
	}

	// When it comes to static properties, they fall into three categories: impassable (infinite cost), normal (1 cost), and difficult terrain (2 cost).
	// Dynamic obstacles caused by spells or abilities use the same categories unless they explicitly state a different cost (eg wall of thorns has 4 cost).
	costFromTerrain(x: number, y: number, map: WorldMap, interactions: TilePropertyInteractions): number {
		const properties: TileFlags = map.getTileProperties(x, y);

		//console.log(`Cost from terrain at (${x}, ${y}):`, properties, "with interactions", interactions);
		if (properties.isWater && interactions.isWater === MovementType.BLOCKED) return Infinity; // Impassable water (can be flown/hovered or walked over)
		if (properties.isLowWall && interactions.isLowWall === MovementType.BLOCKED) return Infinity; // Impassable low wall (can be flown over but not hovered)
		if (properties.isDrop && interactions.isDrop === MovementType.BLOCKED) return Infinity; // Impassable drop (can be flown or hovered over)
		if (properties.isDifficultTerrain && interactions.isDifficultTerrain === MovementType.BLOCKED) return 2; // Difficult terrain, double movement cost

		return 1; // Normal movement cost
	}

	costFromEntities(x: number, y: number, map: WorldMap, creature: Creature): number {
		if (creature.stats.getSizeCategory() === SizeCategory.TINY) return 1; // Tiny creatures can move through occupied tiles without penalty

		const creaturesBounding: Creature[] = entityManager.getCreaturesBoundingWithPosition(map.id, x, y);
		for (const other of creaturesBounding) {
			// Tiny creatures don't occupy the tile they're on.
			if (other._id !== creature._id && other.getOccupiedArea().length !== 0) {
				return Infinity; // Tile is occupied by another creature, impassable
			}
		}

		return 1; // Normal movement cost
	}

	totalPathCost(path: { x: number; y: number; cost: number }[]): number {
		return path.reduce((total, step) => total + step.cost, 0);
	}

	findNearestUnoccupiedTile(
		target: { x: number; y: number },
		map: WorldMap,
		creature: Creature,
		maxDistance: number = 5,
	): { x: number; y: number } | null {
		// First check the target tile itself
		if (this.costToEnter(target.x, target.y, map, creature, creature.stats.getSizeCategory()) !== Infinity) {
			return target;
		}
		for (let distance = 1; distance <= maxDistance; distance++) {
			for (let dx = -distance; dx <= distance; dx++) {
				for (let dy = -distance; dy <= distance; dy++) {
					if (Math.abs(dx) !== distance && Math.abs(dy) !== distance) continue; // Only check the perimeter of the square at the current distance

					const checkX = target.x + dx;
					const checkY = target.y + dy;
					if (!map.inBounds(checkX, checkY)) continue;
					if (this.costToEnter(checkX, checkY, map, creature, creature.stats.getSizeCategory()) !== Infinity) {
						return { x: checkX, y: checkY };
					}
				}
			}
		}
		return null; // No unoccupied tile found within maxDistance
	}
}

// 1e or 2e 🤓❓
const pathfinder = new Pathfinding();
