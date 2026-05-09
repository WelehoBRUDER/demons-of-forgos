"use strict";
var SpeciesType;
(function (SpeciesType) {
    SpeciesType["humanoid"] = "humanoid";
    SpeciesType["beast"] = "beast";
    SpeciesType["undead"] = "undead";
})(SpeciesType || (SpeciesType = {}));
// Defined constants for better readability in code
const TINY = 0.5;
const SMALL = 0.75;
const MEDIUM = 1;
const LARGE = 2;
const HUGE = 3;
const GARGANTUAN = 4; // Maximum size is 4x4 tiles and will never be exceeded by any creature.
const sizeCategories = {
    tiny: 0.5,
    small: 0.75,
    medium: 1,
    large: 2,
    huge: 3,
    gargantuan: 4, // Maximum size is 4x4 tiles and will never be exceeded by any creature.
};
class Species {
    id;
    type;
    size;
    anchorPoints = {
        head: { x: 48, y: 12 },
        body: { x: 122, y: 92 },
        legs: { x: 122, y: 157 },
        feet: { x: 122, y: 220 },
        weapon: { x: 36, y: 105 },
    };
    constructor(data) {
        this.id = data.id;
        this.type = data.type;
        this.size = data.size;
        this.anchorPoints = data.anchorPoints || this.anchorPoints; // Use provided anchor points or default if not specified
    }
    getTexturePath(type) {
        // Implementation for getting texture path based on body type
        return `assets/sprites/player_character/${this.id}/body_${type}.png`;
    }
    getAnchorPoints() {
        return this.anchorPoints;
    }
}
const sizeCategoryModifiers = {
    tiny: [
        {
            id: "tiny_size_modifier",
            target: "ac",
            operation: Operation.add,
            value: 2,
            type: ModifierType.size,
        },
    ],
    small: [
        {
            id: "small_size_modifier",
            target: "ac",
            operation: Operation.add,
            value: 1,
            type: ModifierType.size,
        },
    ],
    medium: [
        {
            id: "medium_size_modifier",
            target: "ac",
            operation: Operation.add,
            value: 0,
            type: ModifierType.size,
        },
    ],
    large: [
        {
            id: "large_size_modifier",
            target: "ac",
            operation: Operation.add,
            value: -1,
            type: ModifierType.size,
        },
    ],
    huge: [
        {
            id: "huge_size_modifier",
            target: "ac",
            operation: Operation.add,
            value: -2,
            type: ModifierType.size,
        },
    ],
    gargantuan: [
        {
            id: "gargantuan_size_modifier",
            target: "ac",
            operation: Operation.add,
            value: -4,
            type: ModifierType.size,
        },
    ],
};
//# sourceMappingURL=species.js.map