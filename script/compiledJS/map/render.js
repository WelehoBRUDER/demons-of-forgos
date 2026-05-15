"use strict";
class MapRenderer {
    canvas;
    ctx;
    propCanvas;
    propCtx;
    objectCanvas;
    objectCtx;
    creatureCanvas;
    creatureCtx;
    effectCanvas;
    effectCtx;
    uiCanvas;
    uiCtx;
    tileSize = atlas.getTileSize();
    map;
    highlightedTile;
    selectedTile = null;
    pathTiles = [];
    constructor(canvas, propCanvas, objectCanvas, creatureCanvas, effectCanvas, uiCanvas) {
        // Initialize canvas and contexts
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.ctx.imageSmoothingEnabled = false;
        this.propCanvas = propCanvas;
        this.propCtx = this.propCanvas.getContext("2d");
        this.propCtx.imageSmoothingEnabled = false;
        this.objectCanvas = objectCanvas;
        this.objectCtx = this.objectCanvas.getContext("2d");
        this.objectCtx.imageSmoothingEnabled = false;
        this.creatureCanvas = creatureCanvas;
        this.creatureCtx = this.creatureCanvas.getContext("2d");
        this.creatureCtx.imageSmoothingEnabled = false;
        this.effectCanvas = effectCanvas;
        this.effectCtx = this.effectCanvas.getContext("2d");
        this.effectCtx.imageSmoothingEnabled = false;
        this.uiCanvas = uiCanvas;
        this.uiCtx = this.uiCanvas.getContext("2d");
        this.uiCtx.imageSmoothingEnabled = false;
        this.highlightedTile = { x: -1, y: -1, _id: -1, _propId: -1 };
        this.selectedTile = null;
        this.map = placeholderMap; // Initialize with a placeholder map to avoid null checks
        this.resizeCanvas();
    }
    getEffectContext() {
        return this.effectCtx;
    }
    getMap() {
        return this.map;
    }
    setMapData(map) {
        this.map = map;
    }
    getCanvas() {
        return this.canvas;
    }
    setHighlightedTile(x, y, _id, _propId) {
        this.highlightedTile = { x, y, _id: _id ?? -1, _propId: _propId ?? -1 };
    }
    getHighlightedTile() {
        return this.highlightedTile;
    }
    getHighlightedTileData() {
        if (this.highlightedTile._id === -1)
            return null;
        return tiles[this.highlightedTile._id];
    }
    getHighlightedTilePropData() {
        if (this.highlightedTile._propId === -1)
            return null;
        return props[this.highlightedTile._propId];
    }
    getMapBounds() {
        return {
            width: this.map.width * this.tileSize,
            height: this.map.height * this.tileSize,
        };
    }
    resizeCanvas = () => {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.propCanvas.width = window.innerWidth;
        this.propCanvas.height = window.innerHeight;
        this.objectCanvas.width = window.innerWidth;
        this.objectCanvas.height = window.innerHeight;
        this.creatureCanvas.width = window.innerWidth;
        this.creatureCanvas.height = window.innerHeight;
        this.effectCanvas.width = window.innerWidth;
        this.effectCanvas.height = window.innerHeight;
        this.uiCanvas.width = window.innerWidth;
        this.uiCanvas.height = window.innerHeight;
        this.renderVisibleMap(camera);
    };
    getWorldProperties() {
        if (!this.map)
            return;
        return {
            mapWidth: this.map.width * this.tileSize,
            mapHeight: this.map.height * this.tileSize,
            screenWidth: this.canvas.width,
            screenHeight: this.canvas.height,
        };
    }
    getScreenProperties(camera) {
        if (!this.map)
            return;
        let cameraX = camera.getX();
        let cameraY = camera.getY();
        const zoom = camera.getZoom();
        const worldProps = this.getWorldProperties();
        // Clamp camera position to map bounds
        const maxCameraX = Math.max(0, worldProps.mapWidth - worldProps.screenWidth / zoom);
        const maxCameraY = Math.max(0, worldProps.mapHeight - worldProps.screenHeight / zoom);
        cameraX = Math.min(Math.max(0, cameraX), maxCameraX);
        cameraY = Math.min(Math.max(0, cameraY), maxCameraY);
        // Define bounds for rendering
        const startX = Math.floor(cameraX / this.tileSize) - 1;
        const startY = Math.floor(cameraY / this.tileSize) - 1;
        const endX = Math.ceil((cameraX + this.canvas.width / zoom) / this.tileSize) + 1;
        const endY = Math.ceil((cameraY + this.canvas.height / zoom) / this.tileSize) + 1;
        const size = this.tileSize * zoom;
        if (worldProps.mapWidth < this.canvas.width / zoom) {
            cameraX = (worldProps.mapWidth - this.canvas.width / zoom) / 2;
        }
        if (worldProps.mapHeight < this.canvas.height / zoom) {
            cameraY = (worldProps.mapHeight - this.canvas.height / zoom) / 2;
        }
        return { cameraX, cameraY, zoom, startX, startY, endX, endY, size };
    }
    getTile(x, y) {
        if (x < 0 || x >= this.map.width || y < 0 || y >= this.map.height)
            return null;
        const tileIndex = this.map.layers.base[y * this.map.width + x];
        return tiles[tileIndex] || null;
    }
    getMinBounds(startX, startY, endX, endY) {
        const minX = Math.max(0, startX);
        const maxX = Math.min(this.map.width, endX);
        const minY = Math.max(0, startY);
        const maxY = Math.min(this.map.height, endY);
        return { minX, maxX, minY, maxY };
    }
    renderVisibleMap(camera) {
        if (!this.map)
            return;
        const { cameraX, cameraY, zoom, startX, startY, endX, endY, size } = this.getScreenProperties(camera);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.propCtx.clearRect(0, 0, this.propCanvas.width, this.propCanvas.height);
        const tileAtlas = atlas.getTileAtlas();
        const propAtlas = atlas.getPropAtlas();
        const { minX, maxX, minY, maxY } = this.getMinBounds(startX, startY, endX, endY);
        const step = this.tileSize * zoom;
        let renderedTiles = 0;
        for (let y = minY; y < maxY; y++) {
            const row = y * this.map.width;
            let screenX = (minX * this.tileSize - cameraX) * zoom;
            const screenY = (y * this.tileSize - cameraY) * zoom;
            for (let x = minX; x < maxX; x++) {
                this.renderTile(tileAtlas, this.map.layers.base[row + x], screenX, screenY, size);
                if (this.map.layers.props[row + x] !== 0) {
                    this.renderProp(propAtlas, this.map.layers.props[row + x], screenX, screenY, size);
                }
                screenX += step;
                renderedTiles++;
            }
        }
        this.renderObjects(camera);
        this.renderCreatures(camera);
        this.renderTileHighlight();
        //console.log(`Rendered ${renderedTiles} tiles`);
    }
    renderObjects(camera) {
        const { cameraX, cameraY, zoom, size } = this.getScreenProperties(camera);
        const objectAtlas = atlas.getObjectAtlas();
        const spriteSize = atlas.getSpriteSize();
        this.objectCtx.clearRect(0, 0, this.objectCanvas.width, this.objectCanvas.height);
        for (const obj of this.map.dynamicObjects) {
            if (obj.shouldSkipRender() && !game.isInEditorMode())
                continue; // Skip rendering if this object is marked to be skipped
            const objectSizeX = obj.getTextureSize().width * zoom;
            const objectSizeY = obj.getTextureSize().height * zoom;
            const rotation = obj.getRotation();
            const { x, y } = obj.getPosition();
            const screenX = (x * this.tileSize - cameraX) * zoom;
            const screenY = (y * this.tileSize - cameraY) * zoom;
            if (screenX + objectSizeX < 0 || screenX > this.canvas.width || screenY + objectSizeY < 0 || screenY > this.canvas.height) {
                continue; // Skip rendering if object is outside the screen bounds
            }
            const { x: atlasX, y: atlasY } = getTexturePositionForDynamicObject(obj);
            const { width: unrotatedWidth, height: unrotatedHeight } = obj.getUnrotatedDimensions();
            const rotated = rotation === 90 || rotation === 270;
            const renderWidth = rotated ? unrotatedHeight : unrotatedWidth;
            const renderHeight = rotated ? unrotatedWidth : unrotatedHeight;
            const centerX = (x + renderWidth / 2) * this.tileSize;
            const centerY = (y + renderHeight / 2) * this.tileSize;
            const screenCenterX = (centerX - cameraX) * zoom;
            const screenCenterY = (centerY - cameraY) * zoom;
            this.objectCtx.save();
            this.objectCtx.translate(screenCenterX, screenCenterY);
            this.objectCtx.rotate((rotation * Math.PI) / 180);
            this.objectCtx.drawImage(objectAtlas, atlasX, atlasY, spriteSize, spriteSize, -objectSizeX / 2, -objectSizeY / 2, objectSizeX, objectSizeY);
            this.objectCtx.restore();
        }
    }
    renderCreatures(camera) {
        const { cameraX, cameraY, zoom, size } = this.getScreenProperties(camera);
        const spriteAtlas = atlas.getSpriteAtlas();
        const spriteSize = atlas.getSpriteSize();
        const dynamicSpriteAtlas = atlas.getDynamicSpriteAtlas();
        this.creatureCtx.clearRect(0, 0, this.creatureCanvas.width, this.creatureCanvas.height);
        for (const creature of entityManager.getCreaturesOnMap(this.map.id)) {
            const { x, y } = creature.getScreenPosition();
            const sizeCategory = creature.stats.getSizeCategory();
            const creatureSize = size * sizeCategory;
            const creatureScreenX = (x - cameraX) * zoom;
            const creatureScreenY = (y - cameraY) * zoom;
            if (creatureScreenX + creatureSize < 0 ||
                creatureScreenX > this.canvas.width ||
                creatureScreenY + creatureSize < 0 ||
                creatureScreenY > this.canvas.height) {
                continue; // Skip rendering if creature is outside the screen bounds
            }
            let atlasX, atlasY = 0;
            let atlasToUse = null;
            if (creature.baseClass === "NPCCreature") {
                const npc = creature;
                // This is a terrible way to retrieve the data, but I haven't yet fixed the issue with spritePosition being lost when a new enemy is added
                const { x: _atlasX, y: _atlasY } = entityManager.getEnemyTemplateById(npc.id)?.getSpritePosition() ?? { x: 0, y: 0 };
                atlasX = _atlasX;
                atlasY = _atlasY;
                atlasToUse = spriteAtlas;
            }
            if (creature.baseClass === "DynamicCreature") {
                const dynamicCreature = creature;
                const { x: _atlasX, y: _atlasY } = atlas.getDynamicSpriteTexturePosition(dynamicCreature);
                atlasX = _atlasX;
                atlasY = _atlasY;
                atlasToUse = dynamicSpriteAtlas;
            }
            const offset = sizeCategory >= SizeCategory.MEDIUM ? 0 : (creatureSize - size) / 2; // Center sprite
            const { x: visualOffsetX, y: visualOffsetY } = creature.getVisualOffset();
            this.creatureCtx.drawImage(atlasToUse, atlasX, atlasY, spriteSize, spriteSize, creatureScreenX - offset - visualOffsetX * zoom, creatureScreenY - offset - visualOffsetY * zoom, creatureSize, creatureSize);
            this.drawCreatureHealthBar(creature, creatureScreenX, creatureScreenY, creatureSize, zoom, offset);
        }
    }
    drawCreaturePortrait(creature, ctx, size = 128) {
        const spriteAtlas = atlas.getSpriteAtlas();
        const spriteSize = atlas.getSpriteSize();
        const dynamicSpriteAtlas = atlas.getDynamicSpriteAtlas();
        const sizeCategory = creature.stats.getSizeCategory();
        const minSize = Size.getMinSizeCategory();
        const maxSize = Size.getMaxSizeCategory();
        const limits = [0.8, 1.2]; // Min and max scale limits for portraits
        const scaledSize = limits[0] + ((sizeCategory - minSize) / (maxSize - minSize)) * (limits[1] - limits[0]); // Scale between 0.8 and 1.2 based on size category
        const creatureSize = size * 3 * scaledSize; // Portraits should be roughly equal size, with minor scaling based on creature size category
        const creatureScreenX = 0;
        const creatureScreenY = 0;
        let atlasX, atlasY = 0;
        let atlasToUse = null;
        if (creature.baseClass === "NPCCreature") {
            const npc = creature;
            // This is a terrible way to retrieve the data, but I haven't yet fixed the issue with spritePosition being lost when a new enemy is added
            const { x: _atlasX, y: _atlasY } = entityManager.getEnemyTemplateById(npc.id)?.getSpritePosition() ?? { x: 0, y: 0 };
            atlasX = _atlasX;
            atlasY = _atlasY;
            atlasToUse = spriteAtlas;
        }
        if (creature.baseClass === "DynamicCreature") {
            const dynamicCreature = creature;
            const { x: _atlasX, y: _atlasY } = atlas.getDynamicSpriteTexturePosition(dynamicCreature);
            atlasX = _atlasX;
            atlasY = _atlasY;
            atlasToUse = dynamicSpriteAtlas;
        }
        const offset = (creatureSize - size) / 2; // Center sprite
        ctx.drawImage(atlasToUse, atlasX, atlasY, spriteSize, spriteSize, creatureScreenX - offset, creatureScreenY, creatureSize, creatureSize);
    }
    drawCreatureHealthBar(creature, screenX, screenY, size, zoom = 1, offset = 0) {
        const hpPercentage = creature.stats.getHpPercentage();
        const barWidth = Math.round(zoom * 6);
        const barHeight = size * 0.9;
        const barX = screenX - barWidth - offset;
        const barY = screenY + (size - barHeight) / 2 - offset;
        const fillY = Math.round(barY + barHeight * (1 - hpPercentage));
        this.creatureCtx.strokeStyle = "gold";
        this.creatureCtx.lineWidth = Math.round(zoom * 2);
        this.creatureCtx.strokeRect(barX, barY, barWidth, barHeight);
        this.creatureCtx.fillStyle = "red";
        this.creatureCtx.fillRect(barX, barY, barWidth, barHeight);
        this.creatureCtx.fillStyle = "green";
        this.creatureCtx.fillRect(barX, fillY, barWidth, barHeight * hpPercentage);
    }
    setSelectedTile(x, y) {
        this.selectedTile = { x, y };
        this.renderTileHighlight();
    }
    renderTile(tileAtlas, tileIndex, screenX, screenY, size) {
        const { x: atlasX, y: atlasY } = tiles[tileIndex].getTexturePosition();
        this.ctx.drawImage(tileAtlas, atlasX, atlasY, atlas.getSpriteSize(), atlas.getSpriteSize(), screenX, screenY, size, size);
    }
    renderProp(propAtlas, propIndex, screenX, screenY, size) {
        const { x: atlasX, y: atlasY } = props[propIndex].getTexturePosition();
        this.propCtx.drawImage(propAtlas, atlasX, atlasY, atlas.getSpriteSize(), atlas.getSpriteSize(), screenX, screenY, size, size);
    }
    renderTileHighlight() {
        if (this.highlightedTile.x === -1 || this.highlightedTile.y === -1)
            return; // No tile to highlight
        this.uiCtx.clearRect(0, 0, this.uiCanvas.width, this.uiCanvas.height);
        if ((game.isMouseHeldDown() && !game.isInEditorMode() && game.getState() !== GameState.COMBAT) || game.isControlledCreatureTurn())
            this.drawPathPrediction();
        const { cameraX, cameraY } = this.getScreenProperties(camera);
        const zoom = camera.getZoom();
        const width = Math.ceil(zoom * 4);
        const size = this.tileSize * zoom - width * 2;
        const screenX = (this.highlightedTile.x * this.tileSize - cameraX) * zoom + width;
        const screenY = (this.highlightedTile.y * this.tileSize - cameraY) * zoom + width;
        if (game.isInEditorMode()) {
            this.renderEditorPreview(cameraX, cameraY, zoom);
        }
        this.uiCtx.strokeStyle = "white";
        this.uiCtx.lineWidth = width;
        this.uiCtx.strokeRect(screenX, screenY, size, size);
        if (this.selectedTile) {
            const selectedScreenX = (this.selectedTile.x * this.tileSize - cameraX) * zoom + width;
            const selectedScreenY = (this.selectedTile.y * this.tileSize - cameraY) * zoom + width;
            this.uiCtx.strokeStyle = "yellow";
            this.uiCtx.lineWidth = width;
            this.uiCtx.strokeRect(selectedScreenX, selectedScreenY, size, size);
        }
    }
    renderEditorPreview(cameraX, cameraY, zoom) {
        if (editor.getBrushes().tileBrush === null && editor.getBrushes().propBrush === null)
            return; // No brush selected, nothing to preview
        const halfBrush = Math.floor(editor.getBrushSize() / 2);
        const worldX = this.highlightedTile.x;
        const worldY = this.highlightedTile.y;
        const { tileBrush, propBrush } = editor.getBrushes();
        const tileIndex = tileBrush !== null ? tileBrush : this.map.layers.base[worldY * this.map.width + worldX];
        const propIndex = propBrush !== null ? propBrush : this.map.layers.props[worldY * this.map.width + worldX];
        const tileAtlas = atlas.getTileAtlas();
        const propAtlas = atlas.getPropAtlas();
        for (let dy = -halfBrush; dy <= halfBrush; dy++) {
            for (let dx = -halfBrush; dx <= halfBrush; dx++) {
                const previewX = worldX + dx;
                const previewY = worldY + dy;
                if (previewX < 0 || previewX >= this.map.width || previewY < 0 || previewY >= this.map.height)
                    continue; // Skip if outside map bounds
                const screenX = (previewX * this.tileSize - cameraX) * zoom;
                const screenY = (previewY * this.tileSize - cameraY) * zoom;
                if (tileIndex !== null) {
                    const { x: atlasX, y: atlasY } = tiles[tileIndex].getTexturePosition();
                    this.uiCtx.globalAlpha = 0.5;
                    this.uiCtx.drawImage(tileAtlas, atlasX, atlasY, atlas.getSpriteSize(), atlas.getSpriteSize(), screenX, screenY, this.tileSize * zoom, this.tileSize * zoom);
                    this.uiCtx.globalAlpha = 1;
                }
                if (propIndex !== null) {
                    const { x: atlasX, y: atlasY } = props[propIndex].getTexturePosition();
                    this.uiCtx.globalAlpha = 0.5;
                    this.uiCtx.drawImage(propAtlas, atlasX, atlasY, atlas.getSpriteSize(), atlas.getSpriteSize(), screenX, screenY, this.tileSize * zoom, this.tileSize * zoom);
                    this.uiCtx.globalAlpha = 1;
                }
            }
        }
    }
    drawPathPrediction() {
        if (game.isInEditorMode())
            return; // Disable path prediction in editor mode
        if (game.mouseHeldDownDuration() < 200)
            return; // Don't show path prediction for quick clicks, only for holds
        if (this.pathTiles.length === 0) {
            this.pathTiles =
                pathfinder.AStar({ x: 0, y: 0 }, [this.highlightedTile], this.map, new Creature({ id: "test_creature", stats: {} })) || [];
        }
        const zoom = camera.getZoom();
        const size = this.tileSize * zoom;
        const { cameraX, cameraY } = this.getScreenProperties(camera);
        this.uiCtx.fillStyle = "rgba(255, 0, 255, 0.5)";
        // Skip the first tile since it's the starting position
        for (let i = 1; i < this.pathTiles.length; i++) {
            const tile = this.pathTiles[i];
            const screenX = (tile.x * this.tileSize - cameraX) * zoom;
            const screenY = (tile.y * this.tileSize - cameraY) * zoom;
            this.uiCtx.fillRect(screenX, screenY, size, size);
        }
    }
    getTileCordsByWorldPosition(worldPos) {
        const tileX = Math.floor(worldPos.x / this.tileSize);
        const tileY = Math.floor(worldPos.y / this.tileSize);
        return { tileX, tileY };
    }
    checkMouseHover(worldPos) {
        const { tileX, tileY } = this.getTileCordsByWorldPosition(worldPos);
        if (tileX < 0 || tileX >= this.map.width || tileY < 0 || tileY >= this.map.height)
            return; // Mouse is outside the map bounds
        if (game.isMouseHeldDown() && !game.isInEditorMode()) {
            const prevGoal = this.getPathPredictionGoal();
            const currentGoal = { x: tileX, y: tileY };
            if (prevGoal && currentGoal.x === prevGoal.x && currentGoal.y === prevGoal.y)
                return; // No change in goal tile
            const start = game.getPlayerPosition();
            if (!start)
                return; // No controlled creature position available
            game.requestPath(start, [currentGoal], game.getControlledCreature(), true);
            this.renderTileHighlight();
        }
        if (!this.highlightHasChanged(worldPos))
            return;
        this.setHighlightedTile(tileX, tileY, this.map.layers.base[tileY * this.map.width + tileX], this.map.layers.props[tileY * this.map.width + tileX]);
        this.renderTileHighlight();
    }
    setPathPrediction(path) {
        this.pathTiles = path;
    }
    getPathPredictionTiles() {
        return this.pathTiles;
    }
    getPathPredictionGoal() {
        if (this.pathTiles.length === 0)
            return null;
        return this.pathTiles[this.pathTiles.length - 1];
    }
    clearPathPrediction() {
        this.pathTiles = [];
    }
    getTotalMapSize() {
        const zoom = camera.getZoom();
        const { width: mapWidth, height: mapHeight } = this.getMapBounds();
        const fullWidth = mapWidth * zoom;
        const fullHeight = mapHeight * zoom;
        return { fullWidth, fullHeight };
    }
    getViewportSize() {
        const zoom = camera.getZoom();
        const viewportWidth = this.canvas.width / zoom;
        const viewportHeight = this.canvas.height / zoom;
        return { viewportWidth, viewportHeight };
    }
    getSelectedObjects() {
        if (!this.selectedTile)
            return [];
        return this.map.getBoundingObjectsAt(this.selectedTile.x, this.selectedTile.y);
    }
    highlightHasChanged(worldPos) {
        const { tileX, tileY } = this.getTileCordsByWorldPosition(worldPos);
        const prevHighlight = this.getHighlightedTile();
        return tileX !== prevHighlight.x || tileY !== prevHighlight.y;
    }
    clearEffectLayer() {
        this.effectCtx.clearRect(0, 0, this.effectCanvas.width, this.effectCanvas.height);
    }
}
// Canvas layers
const canvasLayers = document.querySelector(".canvas-layers");
const tileCanvas = canvasLayers.querySelector(".tile-layer");
const propCanvas = canvasLayers.querySelector(".prop-layer");
const objectCanvas = canvasLayers.querySelector(".object-layer");
const creatureCanvas = canvasLayers.querySelector(".creature-layer");
const effectCanvas = canvasLayers.querySelector(".effect-layer");
const uiCanvas = canvasLayers.querySelector(".ui-layer"); // Currently only for cursor highlight
// Initialize map renderer
const mapRenderer = new MapRenderer(tileCanvas, propCanvas, objectCanvas, creatureCanvas, effectCanvas, uiCanvas);
//const randomWorldMap = generateRandomMap(100, 100);
const devInit = () => {
    const testPlayer = new DynamicCreature({
        id: "test_player",
        species: "human",
        bodyType: BodyType.A,
        uid: "player_character:001", // Unique identifier for the player character
        feats: [],
        bab: 1,
        stats: {
            abilityScores: {
                strength: 16,
                dexterity: 14,
                constitution: 12,
                intelligence: 10,
                wisdom: 10,
                charisma: 8,
            },
        },
    });
    testPlayer.stats.setFaction(Faction.PLAYER);
    testPlayer.classes.addClassLevel(classManager.getClass("fighter"), 1);
    mapRenderer.setMapData(mapManager.getMap("dev_testing_area"));
    const creature = entityManager.addCreature(testPlayer, mapRenderer.getMap().id, -1, -1, "dev_testing_area:spawn_point:5:3");
    creature.inventory.equipItem(itemManager.getItem("shortsword"), EquipmentSlot.WEAPON);
    //creature.inventory.equipItem(itemManager.getItem("shortsword"), EquipmentSlot.OFFHAND);
    creature.inventory.equipItem(itemManager.getItem("leather_armor"), EquipmentSlot.ARMOR);
    game.setControlledCreatureId(creature.getUID());
    mapRenderer.renderVisibleMap(camera);
    mapRenderer.renderTileHighlight();
    creature.stats.resetHP();
    portraitManager.generateAllPortraits();
};
//# sourceMappingURL=render.js.map