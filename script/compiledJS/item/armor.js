"use strict";
// Armor can actually have multiple anchor points and textures (eg. chest, legs, arms) because of armor sets being how DnD handles armor.
class Armor extends Equipment {
    equippableItemData;
    shield; // Whether this armor can be equipped in the offhand slot as a shield
    ac; // The armor class bonus provided by this armor
    dexLimit; // The maximum Dexterity modifier that can be applied to the creature's AC when wearing this armor
    constructor(data) {
        super(data);
        this.type = "Armor";
        this.equippableItemData = data.equippable || [];
        this.anchorPoint = data.anchorPoint || AnchorPointType.body; // Default to "weapon" anchor point if not specified
        this.shield = data.shield;
        this.ac = data.ac;
        this.dexLimit = data.dexLimit;
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
    getDexLimit() {
        return this.dexLimit;
    }
    getModifiers(ctx) {
        if (this.shield) {
            return [
                {
                    id: `${this.id}_shield_modifier`,
                    target: "ac",
                    operation: Operation.add,
                    evaluate: () => this.ac,
                    type: ModifierType.shield,
                },
            ];
        }
        else {
            return [
                {
                    id: `${this.id}_armor_modifier`,
                    target: "ac",
                    operation: Operation.add,
                    evaluate: () => this.ac,
                    type: ModifierType.armor,
                },
            ];
        }
    }
}
//# sourceMappingURL=armor.js.map