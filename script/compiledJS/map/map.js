"use strict";
const tileFlags = {
    0: { isWall: false, isWater: false }, // Example flags for tile index 0
};
class WorldMap {
    id;
    width;
    height;
    layers;
    sizeClearanceMap; // 0-3 size clearance for each tile, calculated from the base layer
    dynamicObjects = [];
    constructor(id, width, height, layers, objects = [], entities = []) {
        this.id = id;
        this.width = width;
        this.height = height;
        this.layers = {
            base: layers.base,
            props: layers.props,
            //flags: new Uint16Array(width * height), // Initialize flags with default values (0)
        };
        this.sizeClearanceMap = new Uint16Array(width * height);
        this.calculateSizeClearanceMap();
        this.dynamicObjects = this.convertStrippedObjectData(objects);
    }
    convertStrippedObjectData(objects) {
        return objects.map((obj) => {
            const object = getDynamicObjectById(obj.i);
            object.restoreStrippedData(obj); // Restore the object's state, position, and UID from the stripped data
            // Implementation for converting stripped object data to dynamic objects
            return object;
        });
    }
    // addCreature(id: string, x: number = -1, y: number = -1) {
    // 	// Implementation for adding a creature by ID
    // 	const creature = new NPCCreature(enemies.find((e) => e.id === id));
    // 	creature.setMap(this.id); // Set the creature's map to this map's ID
    // 	creature.setId(this.creatures.length); // Set the creature's _id to its index in the creatures array
    // 	creature.setPosition(x, y);
    // 	this.creatures.push(creature);
    // }
    inBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }
    getTileProperties(x, y) {
        const index = y * this.width + x;
        const tileId = this.layers.base[index];
        return tiles[tileId].getProperties();
    }
    getPropProperties(x, y) {
        const index = y * this.width + x;
        const propId = this.layers.props[index];
        return props[propId].getProperties();
    }
    // Returns the maximum size category of a creature that can fit on the tile at (x, y) without colliding with walls or water.
    // This does *not* take into account any dynamic obstacles.
    checkTileClearanceForSize(x, y) {
        if (!this.inBounds(x, y))
            return 0;
        const tileProperties = this.getTileProperties(x, y);
        const propProperties = this.getPropProperties(x, y);
        if (tileProperties.isWall || propProperties.isWall) {
            return 0; // No creature can fit on a wall tile
        }
        let maxSize = 1;
        // The check only needs to really start from size >1 since tiny, small and medium creatures all fit on 1 tile.
        for (let size = 2; size <= 3; size++) {
            let canFit = true;
            for (let dx = 0; dx < size; dx++) {
                for (let dy = 0; dy < size; dy++) {
                    const checkX = x + dx;
                    const checkY = y + dy;
                    if (!this.inBounds(checkX, checkY)) {
                        canFit = false;
                        break;
                    }
                    if (this.getTileProperties(checkX, checkY).isWall || this.getPropProperties(checkX, checkY).isWall) {
                        canFit = false;
                        break;
                    }
                }
            }
            if (!canFit)
                break; // No need to check larger sizes if this one can't fit
            maxSize = size; // This size can fit, so update maxSize
        }
        return maxSize;
    }
    calculateSizeClearanceMap() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.sizeClearanceMap[y * this.width + x] = this.checkTileClearanceForSize(x, y);
            }
        }
    }
    getSizeClearanceMap() {
        return this.sizeClearanceMap;
    }
    getClearanceAt(x, y) {
        if (!this.inBounds(x, y))
            return 0;
        return this.sizeClearanceMap[y * this.width + x];
    }
    getBoundingObjectsAt(x, y) {
        for (const obj of this.dynamicObjects) {
            if (obj.shouldSkipRender() && !game.isInEditorMode())
                continue; // Skip if this object is marked to be skipped and we're not in editor mode
            for (const tile of obj.getBoundingTiles()) {
                if (tile.x === x && tile.y === y) {
                    return [obj];
                }
            }
        }
        return [];
    }
    getStrippedMapData() {
        const creaturesOnMap = entityManager.getCreaturesOnMap(this.id);
        return {
            id: this.id,
            width: this.width,
            height: this.height,
            layers: {
                base: this.layers.base,
                props: this.layers.props,
            },
            objects: this.dynamicObjects.map((obj) => obj.getStrippedData()),
            entities: creaturesOnMap.map((creature) => ({
                i: creature.getTemplateId(),
                u: creature.getUID(),
                x: creature.getPosition().x,
                y: creature.getPosition().y,
            })),
        };
    }
    addDynamicObject(obj, x = -1, y = -1) {
        this.dynamicObjects.push(obj);
        const lastObj = this.dynamicObjects[this.dynamicObjects.length - 1];
        lastObj.setPosition(x, y);
        if (!obj.getUID()) {
            lastObj.setUID(generateUID(this.id, obj)); // Set unique id.
        }
    }
    removeDynamicObjectByUID(uid) {
        this.dynamicObjects = this.dynamicObjects.filter((obj) => obj.getUID() !== uid);
    }
    getDynamicObjectByUID(uid) {
        return this.dynamicObjects.find((obj) => obj.getUID() === uid);
    }
}
const placeholderMap = new WorldMap("placeholder", 10, 10, {
    base: new Uint16Array(100), // 10x10 map filled with tile index 0
    props: new Uint16Array(100), // Empty props layer for now
    //flags: new Uint16Array(100), // Default flags
}, []);
// For debug only
const generateRandomMap = (width, height) => {
    if (DEV_MODE.IS_ENABLED()) {
        const layers = {
            base: new Uint16Array(width * height),
            props: new Uint16Array(width * height),
            //flags: new Uint16Array(width * height), // Initialize flags with default values (0)
        };
        // these tiles are weighted towards empty and grass, with a small chance for water and walls
        const randomWeightMultipliers = {
            isWall: 0.5,
            isWater: 0.3,
            isDrop: 0.2,
            isLowWall: 4, // for debug
        };
        const tilesWithWeights = tiles.map((tile) => {
            const properties = tile.getProperties();
            let weight = 1;
            for (const key in randomWeightMultipliers) {
                // @ts-ignore
                if (properties[key]) {
                    // @ts-ignore
                    weight *= randomWeightMultipliers[key];
                }
            }
            return { tile, weight };
        });
        for (let i = 0; i < width * height; i++) {
            const totalWeight = tilesWithWeights.reduce((sum, tw) => sum + tw.weight, 0);
            let randomWeight = Math.random() * totalWeight;
            let selectedTileIndex = 0;
            for (const { tile, weight } of tilesWithWeights) {
                randomWeight -= weight;
                if (randomWeight <= 0) {
                    break;
                }
                selectedTileIndex++;
            }
            layers.base[i] = selectedTileIndex;
            layers.props[i] = 0; // No props for now
            //layers.flags[i] = 0; // Default flags
        }
        return new WorldMap("random_map", width, height, layers);
    }
    else {
        throw new Error("Map generation is only available in dev mode.");
    }
};
const generateEmptyMap = (width, height, tileIndex, id = "empty_map_0") => {
    const layers = {
        base: new Uint16Array(width * height).fill(tileIndex),
        props: new Uint16Array(width * height).fill(0), // No props for now
        //flags: new Uint16Array(width * height),
    };
    return new WorldMap(id, width, height, layers);
};
//# sourceMappingURL=map.js.map