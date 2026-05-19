"use strict";
var SpeciesType;
(function (SpeciesType) {
    SpeciesType["HUMANOID"] = "humanoid";
    SpeciesType["BEAST"] = "beast";
    SpeciesType["UNDEAD"] = "undead";
})(SpeciesType || (SpeciesType = {}));
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
        offhand: { x: 210, y: 102 },
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
    getModifiers(ctx) {
        return [];
    }
    getSize() {
        return this.size;
    }
}
//# sourceMappingURL=species.js.map