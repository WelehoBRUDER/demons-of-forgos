"use strict";
// Constant object states for consistent reference.
const DOOR_CLOSED = "door_closed";
const DOOR_OPEN = "door_open";
var ObjectType;
(function (ObjectType) {
    ObjectType["door"] = "door";
    ObjectType["spawnPoint"] = "spawn_point";
})(ObjectType || (ObjectType = {}));
var EditorDataOptionType;
(function (EditorDataOptionType) {
    EditorDataOptionType["slider"] = "slider";
    EditorDataOptionType["checkbox"] = "checkbox";
    EditorDataOptionType["dropdown"] = "dropdown";
    EditorDataOptionType["textInput"] = "textInput";
    EditorDataOptionType["numberInput"] = "numberInput";
})(EditorDataOptionType || (EditorDataOptionType = {}));
// Dynamic objects are tiles that can change during gameplay, such as doors that can open and close, or traps that can be triggered. They have the same properties as regular tiles, but their state can be modified by game events.
class DynamicObject extends Tile {
    state;
    states;
    width = 1; // Default width of 1 tile
    height = 1; // Default height of 1 tile
    rotation = 0; // Rotation in degrees (0, 90, 180, 270)
    stateTextures; // Optional array of texture paths for each state
    stateTexturePositions = []; // Texture atlas positions for each state
    interactionRange = 1; // Default interaction range of 1 tile
    uid; // Unique identifier for the dynamic object, used for saving/loading and referencing in the map
    x = -1;
    y = -1;
    type;
    isLockedDoor = false; // Only relevant for door-type dynamic objects
    requiredKeyId = null; // Only relevant for locked doors
    unlockDC = null; // Only relevant for locked doors
    skipRender = false; // Whether this object should be rendered on the map
    constructor(data) {
        super(data);
        this.state = data.state ?? 0; // Default to the first state if not specified
        this.states = data.states;
        this.type = data.type;
        this.width = data.width || 1;
        this.height = data.height || 1;
        this.rotation = data.rotation || 0;
        this.stateTextures = data.stateTextures || [];
        this.stateTexturePositions = []; // Populated by atlas
        this.interactionRange = data.interactionRange || 1;
        this.isLockedDoor = data.isLockedDoor || false;
        this.requiredKeyId = data.requiredKeyId || null;
        this.unlockDC = data.unlockDC || null;
        this.skipRender = data.skipRender || false;
    }
    setIsLockedDoor(isLocked) {
        this.isLockedDoor = isLocked;
    }
    setRequiredKeyId(keyId) {
        this.requiredKeyId = keyId;
    }
    setUnlockDC(dc) {
        this.unlockDC = dc;
    }
    shouldSkipRender() {
        return this.skipRender;
    }
    getEditorDynamicData() {
        let objectSpecificData = {};
        if (this.type === ObjectType.door) {
            objectSpecificData.isLockedDoor = {
                value: this.isLockedDoor,
                locked: false,
                optionType: EditorDataOptionType.checkbox,
                setValue: "setIsLockedDoor",
            };
            if (this.isLockedDoor) {
                objectSpecificData.requiredKeyId = {
                    value: this.requiredKeyId,
                    locked: false,
                    optionType: EditorDataOptionType.textInput,
                    setValue: "setRequiredKeyId",
                };
                objectSpecificData.unlockDC = {
                    value: this.unlockDC,
                    locked: false,
                    optionType: EditorDataOptionType.numberInput,
                    setValue: "setUnlockDC",
                };
            }
        }
        return {
            uid: {
                value: this.getUID(),
                locked: true, // UID should not be edited manually to prevent issues with referencing the object in the map
                optionType: EditorDataOptionType.textInput,
                setValue: "setUID",
            },
            rotation: {
                value: this.getRotation(),
                locked: false,
                optionType: EditorDataOptionType.dropdown,
                optionValues: [0, 90, 180, 270],
                setValue: "setRotation",
            },
            x: {
                value: this.getPosition().x,
                locked: false,
                optionType: EditorDataOptionType.numberInput,
                setValue: "setX",
            },
            y: {
                value: this.getPosition().y,
                locked: false,
                optionType: EditorDataOptionType.numberInput,
                setValue: "setY",
            },
            ...objectSpecificData,
        };
    }
    getUID() {
        return this.uid;
    }
    setUID(uid) {
        this.uid = uid;
    }
    getState() {
        return this.state;
    }
    setState(newState) {
        if (newState < 0 || newState >= this.states.length) {
            throw new Error(`Invalid state index ${newState} for dynamic object with id ${this.getId()}`);
        }
        this.state = newState;
        mapRenderer.renderObjects(camera); // Re-render objects to reflect state change
    }
    getCurrentStateId() {
        return this.states[this.state];
    }
    getWidth() {
        return this.rotation === 0 || this.rotation === 180 ? this.width : this.height;
    }
    getHeight() {
        return this.rotation === 0 || this.rotation === 180 ? this.height : this.width;
    }
    getUnrotatedDimensions() {
        return { width: this.width, height: this.height };
    }
    getRotation() {
        return this.rotation;
    }
    getStateTextures() {
        return this.stateTextures;
    }
    getStateTexturePositions() {
        return this.stateTexturePositions;
    }
    getInteractionRange() {
        return this.interactionRange;
    }
    getTexturePosition() {
        return this.getStateTexturePositions()[this.getState()] || { x: -1, y: -1 };
    }
    setRotation(rotation) {
        if (![0, 90, 180, 270].includes(rotation)) {
            throw new Error(`Invalid rotation value ${rotation} for dynamic object with id ${this.getId()}. Rotation must be one of 0, 90, 180, or 270 degrees.`);
        }
        this.rotation = rotation;
    }
    setStateTexturePosition(stateIndex, x, y) {
        if (stateIndex < 0 || stateIndex >= this.states.length) {
            throw new Error(`Invalid state index ${stateIndex} for dynamic object with id ${this.getId()}`);
        }
        this.stateTexturePositions[stateIndex] = { x, y };
    }
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
    setX(x) {
        this.x = x;
    }
    setY(y) {
        this.y = y;
    }
    getPosition() {
        return { x: this.x, y: this.y };
    }
    getTileProperties() {
        const properties = {
            isWall: false,
            isWater: false,
            isDrop: false,
            isLowWall: false,
            isDifficultTerrain: false,
            coverLevel: 0,
        };
        if (this.getCurrentStateId() === DOOR_CLOSED) {
            return {
                ...properties,
                isWall: true,
            };
        }
        return properties;
    }
    getBoundingTiles() {
        const tiles = [];
        const pos = this.getPosition();
        const width = this.getWidth();
        const height = this.getHeight();
        if (width === 1 && height === 1)
            return [pos]; // Optimization for common case of 1x1 objects
        for (let dx = 0; dx < width; dx++) {
            for (let dy = 0; dy < height; dy++) {
                tiles.push({ x: pos.x + dx, y: pos.y + dy });
            }
        }
        return tiles;
    }
    getInteractionTiles() {
        const tiles = [];
        const pos = this.getPosition();
        const range = this.getInteractionRange();
        const width = this.getWidth();
        const height = this.getHeight();
        for (let dx = -range; dx <= width - 1 + range; dx++) {
            for (let dy = -range; dy <= height - 1 + range; dy++) {
                // exclude tiles that are within the object's own area, since those are not interaction tiles
                if (dx >= 0 && dx < width && dy >= 0 && dy < height)
                    continue;
                tiles.push({ x: pos.x + dx, y: pos.y + dy });
            }
        }
        return tiles;
    }
    getTextureSize() {
        const tileSize = atlas.getTileSize();
        const width = this.width;
        const height = this.height;
        return { width: width * tileSize, height: height * tileSize };
    }
    interact(creature) {
        const creaturesInsideObject = entityManager.getCreaturesBoundingWithArea(creature.getMap(), this.getBoundingTiles());
        if (this.getCurrentStateId() === DOOR_CLOSED && creaturesInsideObject.length === 0) {
            this.setState(this.states.indexOf(DOOR_OPEN));
        }
        else if (this.getCurrentStateId() === DOOR_OPEN && creaturesInsideObject.length === 0) {
            this.setState(this.states.indexOf(DOOR_CLOSED));
        }
    }
    restoreStrippedData(data) {
        this.setUID(data.u);
        this.setRotation(data.r);
        this.setPosition(data.x, data.y);
    }
    getStrippedData() {
        return {
            i: this.getId(),
            u: this.getUID(),
            r: this.getRotation(),
            x: this.getPosition().x,
            y: this.getPosition().y,
        };
    }
    getDebugInfo() {
        const baseInfo = super.getDebugInfo();
        const objectInfo = `State: ${this.getCurrentStateId()}, Rotation: ${this.rotation} degrees, Interaction Range: ${this.interactionRange}, Is Locked Door: ${this.isLockedDoor}`;
        return `UID: ${this.uid}, ${baseInfo}, ${objectInfo}`;
    }
    // This is mainly used by the map editor
    getDetailedInfo() {
        return `
		<p><strong>ID:</strong> ${this.getId()}</p>
		<p><strong>State:</strong> ${this.getCurrentStateId()}</p>
		<p><strong>Rotation:</strong> ${this.rotation} degrees</p>
		<p><strong>Interaction Range:</strong> ${this.interactionRange}</p>
		<p><strong>Is Locked Door:</strong> ${this.isLockedDoor}</p>
		<p><strong>UID:</strong> ${this.getUID()}</p>
		`;
    }
}
//# sourceMappingURL=dynamic_object.js.map