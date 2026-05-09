// @ts-nocheck
class MapManager {
	maps: Map<string, WorldMap> = new Map();

	getMap(id: string): WorldMap | undefined {
		return this.maps.get(id);
	}

	addMap(map: StrippedMapData) {
		this.maps.set(map.id, new WorldMap(map.id, map.width, map.height, map.layers, map.objects, map.entities));
		map.entities.forEach((entity) => {
			const creatureData = entityManager.getEnemyTemplateById(entity.i);
			if (creatureData) {
				const creature = new NPCCreature(creatureData);
				creature.setUID(entity.u);
				creature.setPosition(entity.x, entity.y);
				entityManager.addCreature(creature, map.id, entity.x, entity.y);
			}
		});
	}
}

const mapManager = new MapManager();
