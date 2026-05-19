"use strict";
const defaultWidth = 120;
const defaultHeight = 120;
itemManager.addItem(new Armor({
    id: "leather_armor",
    spritePath: "assets/items/armor/leather_chest.png",
    equippable: [
        {
            texturePath: "assets/items/armor/leather_chest.png",
            sizeOnRender: { width: defaultWidth, height: defaultHeight },
            anchorPoint: AnchorPointType.body,
            texturePosition: { x: 0, y: 0 },
        },
        {
            texturePath: "assets/items/armor/leather_leg_bracers.png",
            sizeOnRender: { width: defaultWidth, height: defaultHeight },
            anchorPoint: AnchorPointType.legs,
            texturePosition: { x: 0, y: 0 },
        },
    ],
    shield: false,
    ac: 2,
    dexLimit: 6,
}));
itemManager.addItem(new Armor({
    id: "plate_armor",
    spritePath: "assets/items/armor/iron_armor.png",
    equippable: [
        {
            texturePath: "assets/items/armor/iron_armor.png",
            sizeOnRender: { width: 150, height: 140 },
            anchorPoint: AnchorPointType.body,
            texturePosition: { x: 0, y: 0 },
        },
        {
            texturePath: "assets/items/armor/iron_leg_plates.png",
            sizeOnRender: { width: 130, height: defaultHeight },
            anchorPoint: AnchorPointType.legs,
            texturePosition: { x: 0, y: 0 },
        },
        {
            texturePath: "assets/items/armor/iron_boots.png",
            sizeOnRender: { width: 130, height: defaultHeight },
            anchorPoint: AnchorPointType.feet,
            texturePosition: { x: 0, y: 0 },
        },
    ],
    shield: false,
    ac: 8,
    dexLimit: 1,
}));
itemManager.addItem(new Armor({
    id: "shield",
    spritePath: "assets/items/armor/iron_armor.png",
    equippable: [
        {
            texturePath: "assets/items/armor/iron_armor.png",
            sizeOnRender: { width: 150, height: 140 },
            anchorPoint: AnchorPointType.offhand,
            texturePosition: { x: 0, y: 0 },
        },
    ],
    shield: true,
    ac: 2,
    dexLimit: 0, // This is anyway ignored for shields
}));
itemManager.addItem(new Armor({
    id: "scrap_shield",
    spritePath: "assets/items/armor/iron_armor.png",
    equippable: [
        {
            texturePath: "assets/items/armor/iron_armor.png",
            sizeOnRender: { width: 150, height: 140 },
            anchorPoint: AnchorPointType.offhand,
            texturePosition: { x: 0, y: 0 },
        },
    ],
    shield: true,
    ac: 1,
    dexLimit: 0, // This is anyway ignored for shields
}));
//# sourceMappingURL=armors.js.map