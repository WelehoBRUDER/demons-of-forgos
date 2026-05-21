"use strict";
class EntityManager {
    creatures;
    enemyTemplates;
    constructor() {
        this.creatures = new Map();
        this.enemyTemplates = new Map();
    }
    clearAllEntities() {
        this.creatures.clear();
    }
    addEnemyTemplate(enemy) {
        this.enemyTemplates.set(enemy.getTemplateId(), enemy);
    }
    addCreature(creature, map, x = -1, y = -1, spawnPointUID = "") {
        const type = creature.getBaseClass();
        const id = creature.id;
        let _creature = creature;
        if (type === "NPCCreature") {
            const base = this.getEnemyTemplateById(id);
            // @ts-ignore
            const creature = new NPCCreature(base ?? {});
            if (creature) {
                _creature = creature;
            }
        }
        else if (type === "DynamicCreature") {
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
            }
            else {
                console.warn(`Spawn point with UID ${spawnPointUID} not found on map ${map}`);
            }
        }
        else {
            _creature.setPosition(x, y);
        }
        const mapObject = mapManager.getMap(map) ?? mapRenderer.getMap();
        const unoccupiedSpawnPos = pathfinder.findNearestUnoccupiedTile({ x, y }, mapObject, _creature, 5);
        if (unoccupiedSpawnPos) {
            _creature.setPosition(unoccupiedSpawnPos.x, unoccupiedSpawnPos.y);
        }
        else {
            console.warn(`No unoccupied spawn position found near (${x}, ${y}) for creature ${_creature.id} on map ${map}`);
            return null;
        }
        if (!creature.getUID()) {
            _creature.setUID(generateUID(map, _creature));
        }
        else {
            _creature.setUID(creature.getUID()); // Preserve UID if already set (e.g. when loading from map data)
        }
        _creature.setMap(map);
        this.creatures.set(_creature.getUID().toString(), _creature);
        return _creature;
    }
    getCreaturesOnMap(mapId) {
        const creaturesOnMap = [];
        for (const creature of this.creatures.values()) {
            if (creature.getMap() === mapId) {
                creaturesOnMap.push(creature);
            }
        }
        return creaturesOnMap;
    }
    getEnemyTemplates() {
        return Array.from(this.enemyTemplates.values());
    }
    getEnemyTemplateById(id) {
        return this.enemyTemplates.get(id);
    }
    getCreatureById(id) {
        return this.creatures.get(id?.toString());
    }
    getCreatureByExactPosition(mapId, x, y) {
        for (const creature of this.creatures.values()) {
            if (creature.getMap() === mapId && creature.x === x && creature.y === y) {
                return creature;
            }
        }
        return undefined;
    }
    getCreaturesBoundingWithPosition(mapId, x, y, print = false) {
        const boundingCreatures = [];
        for (const creature of this.creatures.values()) {
            if (!creature.stats.isAlive())
                continue; // Skip dead creatures when checking for bounding
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
    getCreaturesBoundingWithArea(mapId, area, print = false) {
        const boundingCreatures = [];
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
    getDynamicCreaturesOnMap(mapId) {
        const dynamicCreaturesOnMap = [];
        for (const creature of this.creatures.values()) {
            if (creature.getMap() === mapId && creature.getBaseClass() === "DynamicCreature") {
                dynamicCreaturesOnMap.push(creature);
            }
        }
        return dynamicCreaturesOnMap;
    }
    getCreatureByUID(uid) {
        return this.creatures.get(uid);
    }
    getCreaturesByFaction(factions, options) {
        const creaturesInFaction = [];
        for (const creature of this.creatures.values()) {
            if (options?.map && creature.getMap() !== options.map)
                continue;
            //console.log(`Checking creature ${creature.id} with faction ${creature.stats.getFaction()} against requested faction ${faction}`);
            if (factions.includes(creature.stats.getFaction())) {
                creaturesInFaction.push(creature);
            }
        }
        return creaturesInFaction;
    }
    // Finds each creature threatening the target creature (i.e. any creature that has the target within its attack range). This is used for determining opportunity attacks when a creature tries to move away from an adjacent enemy or makes a ranged attack while adjacent to an enemy, as well as flanking.
    getThreateningCreatures(target) {
        const threateningCreatures = [];
        const hostileFactions = target.stats.getHostileFactions();
        const hostiles = this.getCreaturesByFaction(hostileFactions, { map: target.getMap() });
        for (const creature of hostiles) {
            if (creature.getMap() !== target.getMap())
                continue; // A creature can't threaten itself or creatures on other maps
            const threatRange = creature.combat.getThreatRange();
            if (threatRange <= 0)
                continue; // If the creature has no melee attack, it can't threaten
            const distanceToTarget = pathfinder.heuristic(creature.getPosition(), target.getPosition());
            if (distanceToTarget <= threatRange) {
                threateningCreatures.push(creature);
            }
        }
        return threateningCreatures;
    }
}
const entityManager = new EntityManager();
//# sourceMappingURL=entity_manager.js.map