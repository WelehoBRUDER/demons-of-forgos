"use strict";
var AnchorPointType;
(function (AnchorPointType) {
    AnchorPointType["head"] = "head";
    AnchorPointType["body"] = "body";
    AnchorPointType["legs"] = "legs";
    AnchorPointType["feet"] = "feet";
    AnchorPointType["weapon"] = "weapon";
})(AnchorPointType || (AnchorPointType = {}));
class Item {
    id;
    spritePath;
    spritePosition; // Position of the item's sprite on the item atlas
    type; // Class type
    constructor(data) {
        this.id = data.id;
        this.spritePath = data.spritePath || `/assets/items/${data.id}.png`;
        this.spritePosition = { x: -1, y: -1 }; // This will be set when the item atlas is generated
        this.type = "Item";
    }
    getId() {
        return this.id;
    }
    getTexturePath() {
        return this.spritePath;
    }
    setSpritePosition(x, y) {
        this.spritePosition = { x, y };
    }
    getSpritePosition() {
        return this.spritePosition;
    }
    getModifiers(ctx) {
        return [];
    }
}
class ItemManager {
    items;
    constructor() {
        this.items = new Map();
    }
    addItem(item) {
        this.items.set(item.getId(), item);
    }
    getItem(id) {
        return this.items.get(id);
    }
    getAllItems() {
        return Array.from(this.items.values());
    }
}
const itemManager = new ItemManager();
//# sourceMappingURL=item.js.map