"use strict";
// Armor can actually have multiple anchor points and textures (eg. chest, legs, arms) because of armor sets being how DnD handles armor.
class Armor extends Equipment {
    equippableItemData;
    constructor(data) {
        super(data);
        this.type = "Armor";
        this.equippableItemData = data.equippable || [];
        this.anchorPoint = data.anchorPoint || AnchorPointType.body; // Default to "weapon" anchor point if not specified
    }
    getEquippableItemData() {
        return this.equippableItemData;
    }
    setItemTexturePosition(index, x, y) {
        if (index >= 0 && index < this.equippableItemData.length) {
            this.equippableItemData[index].texturePosition = { x, y };
        }
        else {
            console.warn(`Invalid equippable item index: ${index}`);
        }
    }
}
//# sourceMappingURL=armor.js.map