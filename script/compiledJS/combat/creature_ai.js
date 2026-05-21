"use strict";
class CreatureAI {
    owner;
    constructor(owner) {
        this.owner = owner;
    }
    async makeDecision() {
        // Placeholder for AI decision-making logic
        // For now, just find nearest hostile creature and move towards it
        let hostiles = [];
        hostiles = entityManager.getCreaturesByFaction(this.owner.stats.getHostileFactions(), { map: this.owner.getMap() });
        // if (this.owner.stats.getFaction() !== Faction.HOSTILE) {
        // 	hostiles = entityManager.getCreaturesByFaction([Faction.HOSTILE], { map: this.owner.getMap() });
        // } else {
        // 	hostiles = entityManager.getCreaturesByFaction(Faction.PLAYER, { map: this.owner.getMap() });
        // 	hostiles = hostiles.concat(entityManager.getCreaturesByFaction(Faction.NEUTRAL, { map: this.owner.getMap() }));
        // 	hostiles = hostiles.concat(entityManager.getCreaturesByFaction(Faction.FRIENDLY, { map: this.owner.getMap() }));
        // }
        if (hostiles.length === 0) {
            return; // No hostiles to target
        }
        const attackRange = this.owner.combat.getAttackRange(this.owner.inventory.getEquippedItem(EquipmentSlot.WEAPON));
        let nearestHostile = null;
        let nearestDistance = Infinity;
        let bestPath = [];
        for (const hostile of hostiles) {
            const dist = pathfinder.heuristic({ x: this.owner.x, y: this.owner.y }, { x: hostile.x, y: hostile.y });
            if (dist < nearestDistance) {
                const path = pathfinder.AStar({ x: this.owner.x, y: this.owner.y }, [{ x: hostile.x, y: hostile.y }], mapManager.getMap(this.owner.getMap()), this.owner, attackRange, attackRange);
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
        if (pathfinder.heuristic({ x: this.owner.x, y: this.owner.y }, { x: nearestHostile.x, y: nearestHostile.y }) <= attackRange) {
            await this.owner.combat.attack(nearestHostile, { x: nearestHostile.x, y: nearestHostile.y });
            //nearestHostile!.takeDamage(10); // Placeholder damage value
        }
        return new Promise((resolve) => {
            resolve();
        });
    }
}
//# sourceMappingURL=creature_ai.js.map