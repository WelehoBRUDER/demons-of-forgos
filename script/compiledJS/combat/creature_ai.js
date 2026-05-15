"use strict";
class CreatureAI {
    owner;
    constructor(owner) {
        this.owner = owner;
    }
    makeDecision() {
        // Placeholder for AI decision-making logic
        // For now, just find nearest hostile creature and move towards it
        let hostiles = [];
        if (this.owner.stats.getFaction() !== Faction.HOSTILE) {
            hostiles = entityManager.getCreaturesByFaction(Faction.HOSTILE, { map: this.owner.getMap() });
        }
        else {
            hostiles = entityManager.getCreaturesByFaction(Faction.PLAYER, { map: this.owner.getMap() });
            hostiles = hostiles.concat(entityManager.getCreaturesByFaction(Faction.NEUTRAL, { map: this.owner.getMap() }));
            hostiles = hostiles.concat(entityManager.getCreaturesByFaction(Faction.FRIENDLY, { map: this.owner.getMap() }));
        }
        if (hostiles.length === 0) {
            return; // No hostiles to target
        }
        let nearestHostile = null;
        let nearestDistance = Infinity;
        let bestPath = [];
        for (const hostile of hostiles) {
            const dist = pathfinder.heuristic({ x: this.owner.x, y: this.owner.y }, { x: hostile.x, y: hostile.y });
            if (dist < nearestDistance) {
                const path = pathfinder.AStar({ x: this.owner.x, y: this.owner.y }, [{ x: hostile.x, y: hostile.y }], mapManager.getMap(this.owner.getMap()), this.owner);
                const pathCost = path ? pathfinder.totalPathCost(path) : Infinity;
                if (pathCost < nearestDistance) {
                    bestPath = path;
                    nearestDistance = dist;
                    nearestHostile = hostile;
                }
            }
        }
        this.owner.setPath(bestPath);
    }
}
//# sourceMappingURL=creature_ai.js.map