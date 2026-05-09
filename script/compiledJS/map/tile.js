"use strict";
let tileIndex = 0;
class Tile {
    _id;
    id;
    texturePath;
    texturePosition;
    isWall;
    isWater;
    isDrop;
    isLowWall;
    isDifficultTerrain;
    coverLevel;
    constructor(data) {
        this._id = tileIndex++;
        this.id = data.id;
        this.texturePath = data.texturePath;
        // Initialize texturePosition to an invalid value to indicate it hasn't been set
        // This value is automatically updated when the tileSet is loaded and the texture atlas is generated
        this.texturePosition = { x: -1, y: -1 };
        // Default properties so that tiles only need to specify the ones that are true or non-zero
        this.isWall = data.isWall ?? false;
        this.isWater = data.isWater ?? false;
        this.isDrop = data.isDrop ?? false;
        this.isLowWall = data.isLowWall ?? false;
        this.isDifficultTerrain = data.isDifficultTerrain ?? false;
        this.coverLevel = data.coverLevel ?? 0;
    }
    getProperties() {
        return {
            isWall: this.isWall,
            isWater: this.isWater,
            isDrop: this.isDrop,
            isLowWall: this.isLowWall,
            isDifficultTerrain: this.isDifficultTerrain, // For now, treat low walls as difficult terrain. This can be expanded in the future if needed.
            coverLevel: this.coverLevel,
        };
    }
    getIndex() {
        return this._id;
    }
    getId() {
        return this.id;
    }
    getTexturePath() {
        return this.texturePath;
    }
    getTexturePosition() {
        return this.texturePosition;
    }
    setTexturePosition(x, y) {
        this.texturePosition = { x, y };
    }
    getDebugInfo() {
        return `(_INDEX: ${this._id}, ID: ${this.id}, TexturePos: (${this.texturePosition.x}, ${this.texturePosition.y})), Properties: ${JSON.stringify(this.getProperties(), null, 2)}`;
    }
}
//# sourceMappingURL=tile.js.map