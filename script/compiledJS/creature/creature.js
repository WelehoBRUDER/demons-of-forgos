"use strict";
const creatureDefaultModifiers = {
    getModifiers(creature, ctx) {
        return [
            {
                id: "base_fort_save",
                target: Save.FORTITUDE,
                operation: Operation.add,
                evaluate: () => creature.stats.getAbilityScoreModifiers().constitution,
                type: ModifierType.untyped,
            },
            {
                id: "base_ref_save",
                target: Save.REFLEX,
                operation: Operation.add,
                evaluate: () => creature.stats.getAbilityScoreModifiers().dexterity,
                type: ModifierType.untyped,
            },
            {
                id: "base_will_save",
                target: Save.WILL,
                operation: Operation.add,
                evaluate: () => creature.stats.getAbilityScoreModifiers().wisdom,
                type: ModifierType.untyped,
            },
            {
                id: "flanking_bonus",
                target: AttackBonusType.MELEE,
                operation: Operation.add,
                evaluate: (creature, ctx) => {
                    if (!ctx.targetCreature || !ctx.canBeFlanked)
                        return 0;
                    const threateningCreatures = entityManager.getThreateningCreatures(ctx.targetCreature);
                    if (threateningCreatures.length >= 2) {
                        return 2; // +2 to attack rolls when flanking
                    }
                    return 0;
                },
                type: ModifierType.untyped,
            },
            {
                id: "dual_wielding_penalty",
                target: AttackBonusType.MELEE,
                operation: Operation.add,
                evaluate: (creature, ctx) => {
                    if (ctx.isDualWielding) {
                        let penalty = ctx.isPrimary ? -6 : -10;
                        if (ctx.offhandIsLight) {
                            penalty += 2; // Reduce off-hand penalty by 2 if the off-hand weapon is light
                        }
                        return penalty;
                    }
                    return 0;
                },
                type: ModifierType.untyped,
            },
        ];
    },
};
// Player characters don't die immediately at 0 hp.
const dynamicCreatureDefaultModifiers = {
    getModifiers(creature, ctx) {
        return [
            {
                id: "greater_death_threshold",
                target: "deathThreshold",
                operation: Operation.add,
                evaluate: () => creature.stats.getAbilityScores().constitution,
                type: ModifierType.untyped,
            },
        ];
    },
};
let creatureIndex = 0;
class Creature {
    _id;
    id;
    uid;
    x;
    y;
    stats;
    screenX = 0; // For smooth movement, this will be updated gradually towards x
    screenY = 0; // For smooth movement, this will be updated gradually towards y
    baseClass = "Creature";
    lastMoved = 0;
    map; // ID pointing to the map the creature is on, set when added to map
    currentPath = [];
    visualOffsetX = 0; // For smooth movement, this will be updated gradually towards 0
    visualOffsetY = 0; // For smooth movement, this will be updated gradually towards 0
    providers = []; // This can hold references to various sources of modifiers, such as equipped items, active effects, etc.
    providersNeedUpdate = false; // Flag to indicate if providers need to be re-evaluated, for example after taking damage or equipping an item
    bab = 0; // Base Attack Bonus, can be calculated based on class levels for player characters or set as a static value for enemies
    initiative = -Infinity; // Initiative score for turn order in combat, can be set based on stats or randomly
    statusEffects = []; // List of status effect identifiers currently affecting the creature, such as "poisoned", "stunned", etc.
    feats = []; // List of feat identifiers that grant special abilities or modifiers to the creature
    inventory; // Inventory to hold items the creature is carrying, separate from equipped items
    combat; // Combat-related data and methods for the creature
    ai; // AI-related data and methods for the creature
    turn; // Turn controller to manage the creature's turn in combat
    // Animation states
    isMoving = false; // Flag to indicate if the creature is currently moving
    isAttacking = false; // Flag to indicate if the creature is currently performing an attack animation
    constructor(data) {
        this._id = creatureIndex++; // Assign a unique ID to each creature
        this.id = data.id;
        this.x = data.x ?? -1;
        this.y = data.y ?? -1;
        this.map = data.map ?? "";
        this.stats = new CreatureStats(this, data.stats || { hp: 4 });
        this.inventory = new CreatureInventory(this, data.inventory); // Initialize an empty inventory, can be populated with data.inventory if provided
        this.combat = new CreatureCombat(this, data.combat); // Initialize combat data, can be populated with data.combat if provided
        this.screenX = this.x;
        this.screenY = this.y;
        this.lastMoved = Math.random();
        this.uid = data.uid ?? null; // UID will be set when the creature is added to the map
        this.initiative = data.initiative ?? -Infinity; // -Infinity outside combat
        this.feats = data.feats ?? [];
        this.bab = data.bab ?? 0;
        this.ai = new CreatureAI(this); // Initialize AI, can be populated with data.ai if provided
        this.turn = new CreatureTurnController(this); // Initialize turn controller, can be populated with data.turn if provided
        //this.setHP(data.hp ?? this.getMaxHP()); // Set HP to provided value or max HP if not provided
    }
    isInCombat() {
        return combatManager.hasParticipant(this.uid);
    }
    getInventory() {
        return this.inventory;
    }
    restoreStrippedData(data) {
        this.setUID(data.u);
        this.setPosition(data.x, data.y);
    }
    addFeat(featId, params) {
        this.feats.push({ feat: featId, params });
        this.providersNeedUpdate = true; // Mark providers as needing update since feats can change modifiers
    }
    getFeats() {
        return this.feats;
    }
    getFeatProviders() {
        const providers = [];
        for (const featInstance of this.feats) {
            const feat = featManager.getFeat(featInstance.feat);
            if (feat) {
                providers.push(feat);
            }
        }
        return providers;
    }
    getFeatParams(featId) {
        const featInstance = this.feats.find((f) => f.feat === featId);
        return featInstance ? featInstance.params : undefined;
    }
    getUID() {
        return this.uid;
    }
    setUID(uid) {
        this.uid = uid;
    }
    setId(id) {
        this._id = id;
    }
    isPlayerControlled() {
        return game.getControlledCreatureId() === this.uid;
    }
    getTemplateId() {
        return this.id;
    }
    setMap(mapId) {
        this.map = mapId;
    }
    getIndex() {
        return this._id;
    }
    getBaseClass() {
        return this.baseClass;
    }
    getMap() {
        return this.map;
    }
    getAllProviders() {
        if (!this.providersNeedUpdate) {
            return this.providers;
        }
        const updatedProviders = [];
        updatedProviders.push(creatureDefaultModifiers);
        updatedProviders.push(...this.inventory.getAllEquippedItems().map((eq) => eq.item));
        updatedProviders.push(this.stats.getSizeProvider());
        updatedProviders.push(...this.getFeatProviders());
        if (this instanceof DynamicCreature) {
            updatedProviders.push(dynamicCreatureDefaultModifiers);
        }
        // TODO - Add active effects, status effects, feats, racial traits, class features, etc. as providers
        this.providers = updatedProviders;
        this.providersNeedUpdate = false;
        return updatedProviders;
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
        this.screenX = x * atlas.getTileSize();
        this.screenY = y * atlas.getTileSize();
    }
    setX(x) {
        this.x = x;
        this.screenX = x * atlas.getTileSize();
    }
    setY(y) {
        this.y = y;
        this.screenY = y * atlas.getTileSize();
    }
    dexToACLimit() {
        const items = this.inventory.getAllEquippedItems().map((e) => e.item);
        let maxDexLimit = -Infinity;
        for (const item of items) {
            if (item instanceof Armor) {
                const dexLimit = item.getDexLimit();
                if (dexLimit > maxDexLimit) {
                    maxDexLimit = dexLimit;
                }
            }
        }
        return maxDexLimit !== -Infinity ? maxDexLimit : Infinity; // 0 = no benefit, 2 = max +2 AC from dex, etc.
    }
    // This function should only be called for testing.
    // For actual gameplay, use a random wandering behavior or player-controlled movement instead.
    moveRandomly() {
        if (this.isPlayerControlled())
            return;
        const directions = [
            { dx: 0, dy: -1 }, // Up
            { dx: 0, dy: 1 }, // Down
            { dx: -1, dy: 0 }, // Left
            { dx: 1, dy: 0 }, // Right
            { dx: -1, dy: -1 }, // Up-Left
            { dx: 1, dy: -1 }, // Up-Right
            { dx: -1, dy: 1 }, // Down-Left
            { dx: 1, dy: 1 }, // Down-Right
            { dx: 0, dy: 0 }, // Stay in place
        ];
        const randomDirection = directions[Math.floor(Math.random() * directions.length)];
        const newX = this.x + randomDirection.dx;
        const newY = this.y + randomDirection.dy;
        // Check bounds and tile properties before moving
        const cost = pathfinder.costToEnter(newX, newY, mapRenderer.getMap(), this, this.stats.getSizeCategory());
        //console.log(`Creature ${this.id} attempting to move to (${newX}, ${newY}) with movement cost:`, cost);
        if (cost !== Infinity) {
            this.move(newX, newY);
        }
    }
    getOccupiedArea() {
        const box = [];
        const size = this.stats.getSizeCategory();
        // Tiny creatures don't occupy a full tile
        if (size < 0.75) {
            return box;
        }
        // Small and medium creatures occupy the tile they are directly standing on (by x and y coordinates)
        if (size <= 1) {
            return [[this.x, this.y]];
        }
        // Large and huge creatures occupy multiple tiles in a square area based on their size category
        // Size is always symmetrical, ie 1x1, 2x2, 3x3 etc.
        for (let dx = 0; dx < size; dx++) {
            for (let dy = 0; dy < size; dy++) {
                box.push([this.x + dx, this.y + dy]);
            }
        }
        return box;
    }
    setScreenPosition(x, y) {
        this.screenX = x;
        this.screenY = y;
    }
    getScreenPosition() {
        return { x: this.screenX, y: this.screenY };
    }
    getCenterScreenPosition() {
        const offset = (this.stats.getSizeCategory() * atlas.getTileSize()) / 2;
        return { x: this.screenX + offset, y: this.screenY + offset };
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
    move(newX, newY) {
        this.x = newX;
        this.y = newY;
        this.combatStartCheck();
        //mapRenderer.renderVisibleMap(camera); // Re-render the map to reflect the creature's new position
    }
    takeDamage(amount) {
        this.stats.setHP(this.stats.getHP() - amount);
        if (this.stats.getHP() <= 0) {
            //this.die();
        }
        combatEvents.emit(CombatEventId.STAT_CHANGED, { creatureUID: this.getUID() }); // Emit stat changed event to update UI
        if (!this.stats.isAlive()) {
            combatEvents.emit(CombatEventId.CREATURE_DIED, { creatureUID: this.getUID() }); // Emit creature died event for any additional logic that needs to happen on death
            effectManager.addEffect(new CustomFloatingText(`💀`, this.screenX, this.screenY + 100, 24, "red", 1500, 50)); // Show damage taken as floating text
        }
    }
    getHitDice() {
        return [{ type: HitDice.D6, count: 1 }]; // Default to 1 D6 for now, should be overridden by specific creature types
    }
    getHitDiceTotalCount() {
        const hitDice = this.getHitDice();
        let total = 0;
        for (const hd of hitDice) {
            total += hd.count; // Average roll of the hit die
        }
        return total;
    }
    getMoveSpeed() {
        const bonusSpeed = modifierManager.getTotalModifier("movementSpeed", this, {});
        return 6 + bonusSpeed; // Default movement is 6 tiles per action.
    }
    getFlySpeed() {
        return 0; // Flight must be specified by creature stat block.
    }
    getHoverSpeed() {
        return 0; // Hovering must be specified by creature stat block.
    }
    // isWall will always block movement, as it is explicitly an enclosed barrier.
    getTilePropertyInteractions() {
        // 0 means impeded, 1 means normal
        // The return value could also be a weight for pathfinding depending on the speed
        return {
            isWater: this.getFlySpeed() === 0 ? MovementType.BLOCKED : MovementType.NORMAL,
            isLowWall: this.getHoverSpeed() === 0 ? MovementType.BLOCKED : MovementType.NORMAL,
            isDrop: this.getFlySpeed() === 0 ? MovementType.BLOCKED : MovementType.NORMAL,
            isDifficultTerrain: MovementType.BLOCKED, // This can be explicitly changed for creatures that are unaffected by difficult terrain.
        };
    }
    combatStartCheck() {
        if (game.getState() === GameState.COMBAT)
            return; // Don't trigger combat if we're already in combat
        const playerCharacters = entityManager.getCreaturesByFaction([Faction.PLAYER], { map: this.map });
        const hostileCreatures = entityManager.getCreaturesByFaction([Faction.HOSTILE], { map: this.map });
        console.log(playerCharacters, hostileCreatures);
        for (const pc of playerCharacters) {
            if (!pc.stats.isAlive())
                continue;
            for (const creature of hostileCreatures) {
                if (!creature.stats.isAlive())
                    continue;
                const dist = pathfinder.heuristic({ x: creature.x, y: creature.y }, { x: pc.x, y: pc.y });
                if (dist <= creature.getAggroRange()) {
                    game.setState(GameState.COMBAT);
                    combatManager.startCombat(playerCharacters.concat(hostileCreatures));
                    return;
                }
            }
        }
    }
    moveOnPath(dt) {
        this.handleMovementAnimation(dt);
        if (this.currentPath.length === 0) {
            this.isMoving = false;
            return;
        }
        if (!this.hasFinishedMoving())
            return;
        const nextTile = this.currentPath.shift();
        if (nextTile) {
            const cost = pathfinder.costToEnter(nextTile.x, nextTile.y, mapRenderer.getMap(), this, this.stats.getSizeCategory());
            /* Something is blocking the path */
            if (cost === Infinity) {
                const goal = mapRenderer.getPathPredictionGoal();
                this.currentPath = []; // Clear the path if the next tile is no longer passable
                if (goal) {
                    game.requestPath({ x: this.x, y: this.y }, [goal], this);
                }
                return;
            }
            if (game.getState() === GameState.COMBAT) {
                this.combat.applyMovementCost(cost);
                if (this.combat.movement < 0) {
                    this.combat.movement += cost; // Refund movement since we can't actually move there
                    this.currentPath = []; // Clear the path if we have run out of movement
                    combatEvents.emit(CombatEventId.STAT_CHANGED, { creatureUID: this.getUID() }); // Emit stat changed event to update UI
                    return;
                }
            }
            this.move(nextTile.x, nextTile.y);
        }
        else {
            this.isMoving = false; // Clear moving flag when we have reached the end of the path
        }
    }
    getName() {
        return Lang.get(this.id) || this.id; // Fallback to ID if no localized name is found
    }
    getAggroRange() {
        return 5; // Default aggro range of 5 tiles, can be overridden by specific creature types
    }
    setVisualOffset(x, y) {
        this.visualOffsetX = x;
        this.visualOffsetY = y;
    }
    getVisualOffset() {
        return { x: this.visualOffsetX, y: this.visualOffsetY };
    }
    async playMeleeAttackAnimation(target, targetTile, ctx) {
        //if (this.isAttacking) return; // Prevent starting another attack animation if one is already in progress
        this.isAttacking = true;
        combatEvents.emit(CombatEventId.ACTION_STARTED, { creatureUID: this.getUID(), actionId: "melee_attack" }); // Emit action started event to trigger UI updates
        await this.moveTowardsTarget(targetTile, 0.7); // Move halfway towards the target for the attack animation
        this.combat.executeAttack(target, ctx);
        await this.moveTowardsTarget({ x: this.x, y: this.y }, 1);
        this.isAttacking = false;
        return new Promise((resolve) => {
            resolve();
        });
    }
    async moveTowardsTarget(targetTile, progress) {
        return new Promise((resolve) => {
            const startX = this.screenX;
            const startY = this.screenY;
            const targetScreenX = targetTile.x * atlas.getTileSize();
            const targetScreenY = targetTile.y * atlas.getTileSize();
            const deltaX = targetScreenX - startX;
            const deltaY = targetScreenY - startY;
            const animationDuration = game.getAnimationSpeed() / 4;
            const startTime = performance.now();
            const animate = (currentTime) => {
                const elapsedTime = currentTime - startTime;
                const animationProgress = Math.min(elapsedTime / animationDuration, 1) * progress;
                this.setScreenPosition(startX + deltaX * animationProgress, startY + deltaY * animationProgress);
                if (elapsedTime < animationDuration) {
                    requestAnimationFrame(animate);
                }
                else {
                    resolve();
                }
            };
            requestAnimationFrame(animate);
        });
    }
    handleMovementAnimation(dt) {
        const progress = this.movementProgressToNextTile();
        const { x, y } = this.getVisualOffset();
        const walkBob = 10; // How many pixels the creature bobs
        const offsetY = Math.sin(progress * Math.PI) * walkBob; // Bob up and down in a sine wave pattern for a smooth walking animation
        this.setVisualOffset(x, offsetY);
    }
    movementProgressToNextTile() {
        const targetScreenX = this.x * atlas.getTileSize();
        const targetScreenY = this.y * atlas.getTileSize();
        const dx = targetScreenX - this.screenX;
        const dy = targetScreenY - this.screenY;
        const distanceToNextTile = Math.sqrt(dx * dx + dy * dy);
        const totalDistance = atlas.getTileSize();
        return 1 - distanceToNextTile / totalDistance; // Returns a value between 0 and 1 indicating progress towards the next tile
    }
    hasFinishedMoving() {
        return this.movementProgressToNextTile() >= 1; // Consider movement finished when the creature has reached or passed the target tile
    }
    setPath(path) {
        this.isMoving = true; // Set moving flag when a new path is assigned
        path.shift(); // Remove the first tile in the path since it's the tile we're currently on
        this.currentPath = path;
    }
    getPath() {
        return this.currentPath;
    }
    getStrippedData() {
        return {
            i: this.id,
            u: this.uid,
            x: this.x,
            y: this.y,
        };
    }
    isAI() {
        // console.log("Checking if creature is AI-controlled. UID:", this.uid, "Faction:", this.stats.getFaction());
        // console.log(this.uid, this.stats.getFaction());
        return this.stats.getFaction() !== Faction.PLAYER;
    }
    hasFinishedMovingOnPath() {
        return !this.isMoving && this.getPath().length === 0; // Consider movement finished when the creature is not currently moving and has no remaining path to follow
    }
    async animationFinished() {
        return new Promise((resolve) => {
            const checkMovementCompletion = () => {
                if (this.hasFinishedMovingOnPath()) {
                    resolve();
                }
                else {
                    requestAnimationFrame(checkMovementCompletion);
                }
            };
            checkMovementCompletion();
        });
    }
    update(dt) {
        if (this.currentPath.length > 0) {
            this.moveOnPath(dt);
        }
        if (this.hasFinishedMoving()) {
            this.isMoving = false; // Clear moving flag when movement is finished
        }
    }
    createSheet() {
        const sheet = new CreatureSheet(this.uid);
        windowManager.addWindow(`creature_sheet_${this.uid}`, sheet, 80, 65);
    }
}
const creatures = [];
//# sourceMappingURL=creature.js.map