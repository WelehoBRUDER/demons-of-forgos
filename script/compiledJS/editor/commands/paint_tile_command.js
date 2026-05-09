"use strict";
class TilePaintCommand {
    id;
    tileX;
    tileY;
    newTileId;
    previousTileId = null;
    constructor(tileX, tileY, newTileId, previousTileId) {
        this.id = `paintTile_${tileX}_${tileY}`;
        this.tileX = tileX;
        this.tileY = tileY;
        this.newTileId = newTileId;
        this.previousTileId = previousTileId;
    }
    do(state) {
        const index = this.tileY * editor.getMap().width + this.tileX;
        if (index < 0 || index >= state.tiles.length) {
            console.error(`Tile coordinates (${this.tileX}, ${this.tileY}) are out of bounds.`);
            return;
        }
        if (this.previousTileId === null) {
            this.previousTileId = state.tiles[index]; // Store previous tile ID for undo
        }
        editor.applyTileBrush(this.tileX, this.tileY, this.newTileId, state.brushSize); // Apply new tile ID
    }
    undo(state) {
        const index = this.tileY * editor.getMap().width + this.tileX;
        if (index < 0 || index >= state.tiles.length) {
            console.error(`Tile coordinates (${this.tileX}, ${this.tileY}) are out of bounds.`);
            return;
        }
        if (this.previousTileId !== null) {
            state.tiles[index] = this.previousTileId; // Revert tile to previous ID
        }
        editor.applyTileBrush(this.tileX, this.tileY, this.previousTileId, state.brushSize); // Apply previous tile ID
    }
}
//# sourceMappingURL=paint_tile_command.js.map