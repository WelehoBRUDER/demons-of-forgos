class EntityManager {
	creatures: Map<string, Creature>;
	enemyTemplates: Map<string, NPCCreature>;

	constructor() {
		this.creatures = new Map<string, Creature>();
		this.enemyTemplates = new Map<string, NPCCreature>();
	}

	clearAllEntities() {
		this.creatures.clear();
	}

	addEnemyTemplate(enemy: NPCCreature) {
		this.enemyTemplates.set(enemy.getTemplateId(), enemy);
	}

	addCreature(
		creature: Creature | NPCCreature | DynamicCreature,
		map: string,
		x: number = -1,
		y: number = -1,
		spawnPointUID: string = "",
	): Creature | NPCCreature | DynamicCreature | null {
		const type = creature.getBaseClass();
		const id = creature.id;
		let _creature: Creature = creature;
		if (type === "NPCCreature") {
			const base = this.getEnemyTemplateById(id);
			const creature: NPCCreature = new NPCCreature(base ?? ({} as NPCCreatureInterface));
			if (creature) {
				_creature = creature;
			}
		} else if (type === "DynamicCreature") {
			// Not working yet
			// const creature = new DynamicCreature(dynamicCreatures.find((e) => e.id === id));
			// if (creature) {
			// 	_creature = creature;
			// }
		}

		// console.log(
		// 	`Adding creature ${_creature.id} of type ${type} to map ${map} at position (${x}, ${y}) with spawn point UID: ${spawnPointUID}`,
		// );
		if (spawnPointUID.length > 0) {
			const spawnPoint = mapManager.getMap(map)?.getDynamicObjectByUID(spawnPointUID);
			if (spawnPoint) {
				const spawnPos = spawnPoint.getPosition();
				x = spawnPos.x;
				y = spawnPos.y;
			} else {
				console.warn(`Spawn point with UID ${spawnPointUID} not found on map ${map}`);
			}
		} else {
			_creature.setPosition(x, y);
		}
		const mapObject: WorldMap = mapManager.getMap(map) ?? mapRenderer.getMap();
		const unoccupiedSpawnPos = pathfinder.findNearestUnoccupiedTile({ x, y }, mapObject, _creature, 5);
		if (unoccupiedSpawnPos) {
			_creature.setPosition(unoccupiedSpawnPos.x, unoccupiedSpawnPos.y);
		} else {
			console.warn(`No unoccupied spawn position found near (${x}, ${y}) for creature ${_creature.id} on map ${map}`);
			return null;
		}

		if (!creature.getUID()) {
			_creature.setUID(generateUID(map, _creature));
		} else {
			_creature.setUID(creature.getUID()); // Preserve UID if already set (e.g. when loading from map data)
		}

		_creature.setMap(map);
		this.creatures.set(_creature.getUID().toString(), _creature);
		return _creature;
	}

	getCreaturesOnMap(mapId: string): Creature[] {
		const creaturesOnMap: Creature[] = [];
		for (const creature of this.creatures.values()) {
			if (creature.getMap() === mapId) {
				creaturesOnMap.push(creature);
			}
		}
		return creaturesOnMap;
	}

	getEnemyTemplates(): NPCCreature[] {
		return Array.from(this.enemyTemplates.values());
	}

	getEnemyTemplateById(id: string): NPCCreature | undefined {
		return this.enemyTemplates.get(id);
	}

	getCreatureById(id: number | string): Creature | undefined {
		return this.creatures.get(id?.toString());
	}

	getCreatureByExactPosition(mapId: string, x: number, y: number): Creature | undefined {
		for (const creature of this.creatures.values()) {
			if (creature.getMap() === mapId && creature.x === x && creature.y === y) {
				return creature;
			}
		}
		return undefined;
	}

	getCreaturesBoundingWithPosition(mapId: string, x: number, y: number, print: boolean = false): Creature[] {
		const boundingCreatures: Creature[] = [];
		for (const creature of this.creatures.values()) {
			if (creature.getMap() === mapId) {
				const creatureBoundingArea = creature.getOccupiedArea();
				if (print) {
					console.log(`Checking creature ${creature.id} with occupied area:`, creatureBoundingArea);
				}
				if (creatureBoundingArea.some((pos) => pos[0] === x && pos[1] === y)) {
					boundingCreatures.push(creature);
				}
			}
		}
		return boundingCreatures;
	}

	getCreaturesBoundingWithArea(mapId: string, area: { x: number; y: number }[], print: boolean = false): Creature[] {
		const boundingCreatures: Creature[] = [];
		for (const creature of this.creatures.values()) {
			if (creature.getMap() === mapId) {
				const creatureBoundingArea = creature.getOccupiedArea();
				if (print) {
					console.log(`Checking creature ${creature.id} with occupied area:`, creatureBoundingArea);
				}
				if (creatureBoundingArea.some((pos) => area.some((a) => a.x === pos[0] && a.y === pos[1]))) {
					boundingCreatures.push(creature);
				}
			}
		}
		return boundingCreatures;
	}

	getDynamicCreaturesOnMap(mapId: string): DynamicCreature[] {
		const dynamicCreaturesOnMap: DynamicCreature[] = [];
		for (const creature of this.creatures.values()) {
			if (creature.getMap() === mapId && creature.getBaseClass() === "DynamicCreature") {
				dynamicCreaturesOnMap.push(creature as DynamicCreature);
			}
		}
		return dynamicCreaturesOnMap;
	}

	getCreatureByUID(uid: string): Creature | undefined {
		return this.creatures.get(uid);
	}
}

const entityManager = new EntityManager();
