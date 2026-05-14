"use strict";
// Masculine and feminine body types. If species doesn't have body type variations, just use "A" for all creatures of that species.
var BodyType;
(function (BodyType) {
    BodyType["A"] = "A";
    BodyType["B"] = "B";
})(BodyType || (BodyType = {}));
var EquipmentSlot;
(function (EquipmentSlot) {
    EquipmentSlot["WEAPON"] = "weapon";
    EquipmentSlot["OFFHAND"] = "offhand";
    EquipmentSlot["ARMOR"] = "armor";
    EquipmentSlot["RING1"] = "ring1";
    EquipmentSlot["RING2"] = "ring2";
    EquipmentSlot["AMULET"] = "amulet";
    EquipmentSlot["HANDS"] = "hands";
    EquipmentSlot["FEET"] = "feet";
    EquipmentSlot["HEAD"] = "head";
    EquipmentSlot["CAPE"] = "cape";
})(EquipmentSlot || (EquipmentSlot = {}));
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
        this.equipment = data.equipment || {};
        this.uid = data.uid; // Set the UID from the data, which should be unique for each dynamic creature
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
            items: this.getAllEquippedItems(),
        };
    }
    getMaxHP() {
        let base = super.getMaxHP();
        let firstHitDie = this.getHitDice()[0]; // Assuming the first hit die is the one to use for base HP calculation
        // Slightly janky maybe, but this lines makes it so that dynamic creatures benefit from their full hit die at 1st level.
        return Math.floor(base + firstHitDie.type - (firstHitDie.type / 2 + 1));
    }
    equipItem(item, slot) {
        super.equipItem(item, slot);
        this.renderSprite(); // Re-render the sprite to reflect the equipped item
    }
    // Dynamic creatures must be tracked separately due to unique rendering.
    getIndex() {
        return this._id;
    }
    getSizeCategoryId() {
        return speciesManager.getSpeciesById(this.species)?.size.toString() || "medium";
    }
    getSizeCategory() {
        return speciesManager.getSpeciesById(this.species)?.size || SizeCategory.MEDIUM;
    }
    renderSprite() {
        atlas.drawDynamicSprite(this);
    }
}
//# sourceMappingURL=dynamic_creature.js.map