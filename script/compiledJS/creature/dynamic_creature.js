"use strict";
// All PCs use this class because their rendering starts from a base body sprite with hair, items etc layered on top.
class DynamicCreature extends Creature {
    static nextId = 1; // Static property to keep track of the next available ID
    species;
    bodyType;
    hair;
    eyes;
    mouth;
    constructor(data) {
        super(data);
        this._id = DynamicCreature.nextId++; // Assign the current value of nextId to _id, then increment nextId
        this.species = data.species;
        this.bodyType = data.bodyType || BodyType.A; // Default to body type "A" if not specified
        this.hair = data.hair || 1;
        this.eyes = data.eyes || 1;
        this.mouth = data.mouth || 1;
        this.baseClass = "DynamicCreature";
        this.uid = data.uid; // Set the UID from the data, which should be unique for each dynamic creature
        this.stats = new DynamicCreatureStats(this, data.stats);
        this.inventory = new DynamicCreatureInventory(this, data.inventory || { items: [], equipment: {} });
        this.renderSprite();
    }
    // Dynamic creatures are rendered on their own atlas with separate textures for each customization option.
    // Their sprites on the atlas are redrawn only when something about their appearance changes, such as equipping a new item.
    getTexturesToRender() {
        const species = speciesManager.getSpeciesById(this.species);
        if (!species) {
            throw new Error(`Species not found for ID: ${this.species}`);
        }
        return {
            body: species.getTexturePath(this.bodyType),
            ears: `assets/sprites/player_character/${this.species}/ears.png`,
            hair: `assets/sprites/player_character/hair/hair_${this.hair}.png`,
            eyes: `assets/sprites/player_character/eyes/eyes_${this.eyes}.png`,
            mouth: `assets/sprites/player_character/mouth/nose_mouth_${this.mouth}.png`,
            items: this.inventory.getAllEquippedItems(),
        };
    }
    // Dynamic creatures must be tracked separately due to unique rendering.
    getIndex() {
        return this._id;
    }
    getSizeCategoryId() {
        return speciesManager.getSpeciesById(this.species)?.size.toString() || "medium";
    }
    renderSprite() {
        atlas.drawDynamicSprite(this);
    }
}
class DynamicCreatureStats extends CreatureStats {
    constructor(owner, stats) {
        super(owner, stats);
        this.owner = owner;
    }
    getMaxHP() {
        let base = super.getMaxHP();
        let firstHitDie = this.owner.getHitDice()[0]; // Assuming the first hit die is the one to use for base HP calculation
        // Slightly janky maybe, but this lines makes it so that dynamic creatures benefit from their full hit die at 1st level.
        return Math.floor(base + firstHitDie.type - (firstHitDie.type / 2 + 1));
    }
    getSizeCategory() {
        return speciesManager.getSpeciesById(this.owner.species)?.size || SizeCategory.MEDIUM;
    }
}
class DynamicCreatureInventory extends CreatureInventory {
    constructor(owner, inventory) {
        super(owner, inventory);
        this.owner = owner;
    }
    equipItem(item, slot) {
        super.equipItem(item, slot);
        this.owner.renderSprite(); // Re-render the creature's sprite whenever an item is equipped to reflect the change visually
    }
}
//# sourceMappingURL=dynamic_creature.js.map