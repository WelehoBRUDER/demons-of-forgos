"use strict";
// texturePath is not relevant for dynamic objects, but is a leftover from the Tile class.
const dynamicObjects = [
    new DynamicObject({
        id: "spawn_point",
        texturePath: "assets/objects/spawn_point.png",
        states: ["default"],
        width: 1,
        height: 1,
        stateTextures: ["assets/objects/spawn_point.png"],
        skipRender: true, // Only visible in the editor, not rendered on the map
        type: ObjectType.spawnPoint,
    }),
    new DynamicObject({
        id: "wooden_door",
        texturePath: "assets/objects/door.png",
        states: [DOOR_CLOSED, DOOR_OPEN],
        width: 1,
        height: 1,
        stateTextures: ["assets/objects/door.png", "assets/objects/door_open.png"],
        type: ObjectType.door,
    }),
    new DynamicObject({
        id: "wooden_double_door",
        texturePath: "assets/objects/double_door.png",
        states: [DOOR_CLOSED, DOOR_OPEN],
        width: 2,
        height: 1,
        stateTextures: ["assets/objects/double_door.png", "assets/objects/double_door_open.png"],
        type: ObjectType.door,
    }),
];
const getDynamicObjectById = (id) => {
    let obj = dynamicObjects.find((obj) => obj.getId() === id);
    if (!obj) {
        return undefined;
    }
    return new DynamicObject(obj); // Return a new instance to avoid shared state issues
};
const getTexturePositionForDynamicObject = (obj) => {
    const _obj = dynamicObjects.find((o) => o.getId() === obj.getId());
    if (_obj) {
        return _obj.getStateTexturePositions()[obj.getState()] || { x: -1, y: -1 };
    }
};
//# sourceMappingURL=dynamic_objects.js.map