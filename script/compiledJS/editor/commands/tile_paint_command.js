"use strict";
class TilePaintCommand {
    id;
    affectedTiles;
    constructor(affectedTiles) {
        this.id = `paintTile_${affectedTiles[0].x}_${affectedTiles[0].y}`;
        this.affectedTiles = affectedTiles;
    }
    do(state) {
        const index = this.affectedTiles[0].y * editor.getMap().width + this.affectedTiles[0].x;
        if (index < 0 || index >= state.tiles.length) {
            console.error(`Tile coordinates (${this.affectedTiles[0].x}, ${this.affectedTiles[0].y}) are out of bounds.`);
            return;
        }
        for (const tile of this.affectedTiles) {
            const tileIndex = tile.y * editor.getMap().width + tile.x;
            if (tileIndex < 0 || tileIndex >= state.tiles.length) {
                console.error(`Tile coordinates (${tile.x}, ${tile.y}) are out of bounds.`);
                continue;
            }
            state.tiles[tileIndex] = tile.after; // Update tile ID in state
        }
    }
    undo(state) {
        const index = this.affectedTiles[0].y * editor.getMap().width + this.affectedTiles[0].x;
        if (index < 0 || index >= state.tiles.length) {
            console.error(`Tile coordinates (${this.affectedTiles[0].x}, ${this.affectedTiles[0].y}) are out of bounds.`);
            return;
        }
        for (const tile of this.affectedTiles) {
            const tileIndex = tile.y * editor.getMap().width + tile.x;
            if (tileIndex < 0 || tileIndex >= state.tiles.length) {
                console.error(`Tile coordinates (${tile.x}, ${tile.y}) are out of bounds.`);
                continue;
            }
            state.tiles[tileIndex] = tile.before; // Revert tile ID in state
        }
    }
}
//# sourceMappingURL=tile_paint_command.js.map