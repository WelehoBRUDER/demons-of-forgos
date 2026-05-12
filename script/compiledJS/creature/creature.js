"use strict";
var AbilityScore;
(function (AbilityScore) {
    AbilityScore["STRENGTH"] = "strength";
    AbilityScore["DEXTERITY"] = "dexterity";
    AbilityScore["CONSTITUTION"] = "constitution";
    AbilityScore["INTELLIGENCE"] = "intelligence";
    AbilityScore["WISDOM"] = "wisdom";
    AbilityScore["CHARISMA"] = "charisma";
})(AbilityScore || (AbilityScore = {}));
// Movement constants
var MovementType;
(function (MovementType) {
    MovementType[MovementType["BLOCKED"] = 0] = "BLOCKED";
    MovementType[MovementType["NORMAL"] = 1] = "NORMAL";
})(MovementType || (MovementType = {}));
var Faction;
(function (Faction) {
    Faction[Faction["HOSTILE"] = 0] = "HOSTILE";
    Faction[Faction["NEUTRAL"] = 1] = "NEUTRAL";
    Faction[Faction["FRIENDLY"] = 2] = "FRIENDLY";
})(Faction || (Faction = {}));
var HitDice;
(function (HitDice) {
    HitDice[HitDice["D4"] = 4] = "D4";
    HitDice[HitDice["D6"] = 6] = "D6";
    HitDice[HitDice["D8"] = 8] = "D8";
    HitDice[HitDice["D10"] = 10] = "D10";
    HitDice[HitDice["D12"] = 12] = "D12";
    HitDice[HitDice["D20"] = 20] = "D20";
})(HitDice || (HitDice = {}));
const defaultAbilityScores = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
};
let creatureIndex = 0;
class Creature {
    _id;
    id;
    uid;
    x;
    y;
    abilityScores = defaultAbilityScores;
    screenX = 0; // For smooth movement, this will be updated gradually towards x
    screenY = 0; // For smooth movement, this will be updated gradually towards y
    baseClass = "Creature";
    lastMoved = 0;
    map; // ID pointing to the map the creature is on, set when added to map
    faction = Faction.NEUTRAL; // 0 = hostile, 1 = neutral, 2 = friendly. This can be used for AI behavior and targeting.
    sizeCategory = SizeCategory.MEDIUM;
    currentPath = [];
    visualOffsetX = 0; // For smooth movement, this will be updated gradually towards 0
    visualOffsetY = 0; // For smooth movement, this will be updated gradually towards 0
    providers = []; // This can hold references to various sources of modifiers, such as equipped items, active effects, etc.
    providersNeedUpdate = false; // Flag to indicate if providers need to be re-evaluated, for example after taking damage or equipping an item
    bab = 0; // Base Attack Bonus, can be calculated based on class levels for player characters or set as a static value for enemies
    initiative = 0; // Initiative score for turn order in combat, can be set based on stats or randomly
    statusEffects = []; // List of status effect identifiers currently affecting the creature, such as "poisoned", "stunned", etc.
    feats = []; // List of feat identifiers that grant special abilities or modifiers to the creature
    equipment = {}; // Object to hold equipped items, which can provide modifiers and affect the creature's stats and abilities
    hp = 4;
    constructor(data) {
        this._id = creatureIndex++; // Assign a unique ID to each creature
        this.id = data.id;
        this.x = data.x ?? -1;
        this.y = data.y ?? -1;
        this.map = data.map ?? "";
        this.abilityScores = data.abilityScores ? { ...data.abilityScores } : { ...defaultAbilityScores };
        this.faction = data.faction ?? Faction.NEUTRAL;
        this.sizeCategory = data.sizeCategory ?? SizeCategory.MEDIUM;
        this.screenX = this.x;
        this.screenY = this.y;
        this.lastMoved = Math.random();
        this.uid = data.uid ?? null; // UID will be set when the creature is added to the map
        this.initiative = data.initiative ?? 0; // 0 outside combat
        this.feats = data.feats ?? [];
        this.bab = data.bab ?? 0;
        this.setHP(data.hp ?? this.getMaxHP()); // Set HP to provided value or max HP if not provided
    }
    restoreStrippedData(data) {
        this.setUID(data.u);
        this.setPosition(data.x, data.y);
    }
    addFeat(featId) {
        this.feats.push(featId);
        this.providersNeedUpdate = true; // Mark providers as needing update since feats can change modifiers
    }
    getFeats() {
        return this.feats;
    }
    getFeatProviders() {
        const providers = [];
        for (const featId of this.feats) {
            const feat = featManager.getFeat(featId);
            if (feat) {
                providers.push(feat);
            }
        }
        return providers;
    }
    resetHP() {
        this.setHP(this.getMaxHP());
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
    setFaction(faction) {
        this.faction = faction;
    }
    getIndex() {
        return this._id;
    }
    getInitiative() {
        return this.initiative;
    }
    getInitiativeBonus() {
        let base = this.getAbilityScoreModifiers().dexterity;
        const bonuses = modifierManager.getTotalModifier("initiative", this, {});
        return base + bonuses;
    }
    getBaseClass() {
        return this.baseClass;
    }
    getMap() {
        return this.map;
    }
    getFaction() {
        return this.faction;
    }
    getHitDice() {
        // This should be implemented based on the creature's class or species
        // Typically, enemies return a static count while player characters calculate it based on their class levels and hit dice progression
        return [{ type: HitDice.D6, count: 1 }]; // Default to 1 D6 for now
    }
    getBaseAttackBonus() {
        return this.bab; // This should be calculated based on class levels for player characters or set as a static value for enemies
    }
    getHitDiceTotalCount() {
        const hitDice = this.getHitDice();
        let total = 0;
        for (const hd of hitDice) {
            total += hd.count; // Average roll of the hit die
        }
        return total;
    }
    getAllProviders() {
        if (!this.providersNeedUpdate) {
            return this.providers;
        }
        const updatedProviders = [];
        updatedProviders.push(...this.getAllEquippedItems());
        updatedProviders.push(this.getSizeProvider());
        updatedProviders.push(...this.getFeatProviders());
        // TODO - Add active effects, status effects, feats, racial traits, class features, etc. as providers
        this.providers = updatedProviders;
        this.providersNeedUpdate = false;
        return updatedProviders;
    }
    getAC() {
        let ac = 10;
        let touchAC = 10;
        let flatFootedAC = 10;
        const dexBonus = this.getAbilityScoreModifiers().dexterity;
        ac += Math.min(dexBonus, this.dexToACLimit());
        touchAC += Math.min(dexBonus, this.dexToACLimit());
        const acBonuses = modifierManager.getTotalModifier("ac", this, null, { groupedByType: true });
        for (const modType in acBonuses) {
            const value = acBonuses[modType] || 0;
            if (modType === ModifierType.armor || modType === ModifierType.shield || modType === ModifierType.naturalArmor) {
                ac += value;
                flatFootedAC += value;
            }
            else {
                ac += value;
                touchAC += value;
                flatFootedAC += value;
            }
        }
        // Future: Add armor, shields, natural armor, magical effects, etc.
        return {
            full: ac,
            touch: touchAC,
            flatFooted: flatFootedAC,
        };
    }
    getAllEquippedItems() {
        const items = [];
        if (this.equipment.weapon) {
            items.push(this.equipment.weapon);
        }
        if (this.equipment.offhand) {
            items.push(this.equipment.offhand);
        }
        if (this.equipment.armor) {
            items.push(this.equipment.armor);
        }
        return items;
    }
    equipItem(item) {
        this.providersNeedUpdate = true; // Mark providers as needing update since equipment can change modifiers
        if (item instanceof Weapon) {
            this.equipment.weapon = item;
        }
        if (item instanceof Armor) {
            this.equipment.armor = item;
        }
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
        const items = this.getAllEquippedItems();
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
        const cost = pathfinder.costToEnter(newX, newY, mapRenderer.getMap(), this, this.getSizeCategory());
        //console.log(`Creature ${this.id} attempting to move to (${newX}, ${newY}) with movement cost:`, cost);
        if (cost !== Infinity) {
            this.move(newX, newY);
        }
    }
    getSizeCategoryId() {
        return SizeCategory[this.sizeCategory];
    }
    getSizeCategory() {
        return this.sizeCategory;
    }
    getSizeProvider() {
        return Size.getProvider(this.sizeCategory);
    }
    getOccupiedArea() {
        const box = [];
        const size = this.getSizeCategory();
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
        const offset = (this.getSizeCategory() * atlas.getTileSize()) / 2;
        return { x: this.screenX + offset, y: this.screenY + offset };
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
    move(newX, newY) {
        this.x = newX;
        this.y = newY;
        //mapRenderer.renderVisibleMap(camera); // Re-render the map to reflect the creature's new position
    }
    getHP() {
        return this.hp;
    }
    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            //this.die();
        }
    }
    calcAbilityModifierFromScore(score) {
        return Math.floor((score - 10) / 2);
    }
    getAbilityScores() {
        const scores = { ...this.abilityScores };
        for (const ability in scores) {
            const bonuses = modifierManager.getTotalModifier(ability, this, {});
            scores[ability] += bonuses;
        }
        return scores;
    }
    getAbilityScoreModifiers() {
        const scores = this.getAbilityScores();
        return {
            strength: this.calcAbilityModifierFromScore(scores.strength),
            dexterity: this.calcAbilityModifierFromScore(scores.dexterity),
            constitution: this.calcAbilityModifierFromScore(scores.constitution),
            intelligence: this.calcAbilityModifierFromScore(scores.intelligence),
            wisdom: this.calcAbilityModifierFromScore(scores.wisdom),
            charisma: this.calcAbilityModifierFromScore(scores.charisma),
        };
    }
    getMaxHP() {
        let base = 0;
        const flatBonus = modifierManager.getTotalModifier("hp", this, {});
        const hitDieBonus = modifierManager.getTotalModifier("hp.per_hitDie", this, {});
        const constitutionBonus = this.getAbilityScoreModifiers().constitution;
        const hitDice = this.getHitDice();
        if (!hitDice)
            return 1;
        Object.values(hitDice).forEach((hitDieInfo) => {
            base += hitDieInfo.count * (hitDieInfo.type / 2 + 1); // Average roll of the hit die, e.g. D6 averages to 3.5, so (6/2)+1 = 4
            base += hitDieInfo.count * (hitDieBonus + constitutionBonus); // Add any per-hit-die bonuses
        });
        Math.floor(base);
        return base + flatBonus;
    }
    getHpPercentage() {
        return Math.max(0, this.hp / this.getMaxHP());
    }
    getMoveSpeed() {
        return 6; // Default movement is 6 tiles per action.
    }
    getFlySpeed() {
        return 0; // Flight must be specified by creature stat block.
    }
    getHoverSpeed() {
        return 0; // Hovering must be specified by creature stat block.
    }
    setHP(amount) {
        this.hp = amount;
        this.hp = Math.min(this.hp, this.getMaxHP()); // Ensure HP does not exceed max HP
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
    rollInitiative() {
        const roll = DiceRoller.roll(Dice.d20)[0];
        const initiative = roll + this.getAbilityScoreModifiers().dexterity;
        this.initiative = initiative;
        return initiative;
    }
    moveOnPath(dt) {
        this.handleMovementAnimation(dt);
        if (this.currentPath.length === 0 || !this.hasFinishedMoving())
            return;
        const nextTile = this.currentPath.shift();
        if (nextTile) {
            const cost = pathfinder.costToEnter(nextTile.x, nextTile.y, mapRenderer.getMap(), this, this.getSizeCategory());
            /* Something is blocking the path */
            if (cost === Infinity) {
                const goal = mapRenderer.getPathPredictionGoal();
                this.currentPath = []; // Clear the path if the next tile is no longer passable
                if (goal) {
                    game.requestPath({ x: this.x, y: this.y }, [goal], this);
                }
                return;
            }
            this.move(nextTile.x, nextTile.y);
        }
    }
    setVisualOffset(x, y) {
        this.visualOffsetX = x;
        this.visualOffsetY = y;
    }
    getVisualOffset() {
        return { x: this.visualOffsetX, y: this.visualOffsetY };
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
}
const creatures = [];
//# sourceMappingURL=creature.js.map