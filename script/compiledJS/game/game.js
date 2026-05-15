"use strict";
let secondCounter = 0;
let tilesChecked = 0;
var GameState;
(function (GameState) {
    GameState[GameState["FREE_ROAM"] = 0] = "FREE_ROAM";
    GameState[GameState["COMBAT"] = 1] = "COMBAT";
})(GameState || (GameState = {}));
class Game {
    state = GameState.FREE_ROAM;
    time = 0;
    lastTime = 0;
    mouseHeldDown = false;
    mouseHeldDownStart = 0; // Timestamp when the mouse was first held down, used to differentiate between clicks and holds
    keysPressed = new Set();
    fpsCounter;
    frameCount = [];
    mouseX = 0;
    mouseY = 0;
    devInfo = document.querySelector(".dev-info");
    paused = false;
    pausedOverlay = document.querySelector(".paused");
    controlledCreatureId = null;
    animationSpeedMultiplier = 1;
    pathRequestQueue = [];
    PATH_REQUEST_BUDGET_PER_FRAME = 4; // How many ms to spend on processing path requests each frame
    isEditorMode = false; // Flag to indicate if we're in editor mode, which can disable certain game mechanics for testing
    keyHeldInterval = 75; // Interval in ms for processing held keys
    lastKeyHeldProcessed = 0; // Timestamp of the last time we processed held keys
    constructor() {
        this.fpsCounter = document.querySelector(".fps-counter");
        window.addEventListener("resize", mapRenderer.resizeCanvas);
    }
    setIsEditorMode(isEditor) {
        this.isEditorMode = isEditor;
    }
    isInEditorMode() {
        return this.isEditorMode;
    }
    setControlledCreatureId(id) {
        this.controlledCreatureId = id;
        const creature = entityManager.getCreatureByUID(id);
        if (creature) {
            camera.setTracking(creature);
        }
        else {
            camera.setTracking(null);
            this.controlledCreatureId = null;
        }
    }
    getControlledCreatureId() {
        return this.controlledCreatureId;
    }
    getControlledCreature() {
        if (this.controlledCreatureId === null)
            return null;
        return entityManager.getCreatureByUID(this.controlledCreatureId) || null;
    }
    getState() {
        return this.state;
    }
    setState(newState) {
        this.state = newState;
        if (newState === GameState.COMBAT) {
        }
    }
    togglePause() {
        this.paused = !this.paused;
        if (!this.paused) {
            this.lastTime = performance.now();
        }
        this.updatePausedOverlay();
    }
    updatePausedOverlay() {
        this.pausedOverlay.style.display = this.paused ? "block" : "none";
    }
    isPaused() {
        return this.paused;
    }
    pause() {
        this.paused = true;
        this.updatePausedOverlay();
    }
    resume() {
        this.paused = false;
        this.lastTime = performance.now();
        this.updatePausedOverlay();
    }
    getKeysPressed() {
        return this.keysPressed;
    }
    setMouseHeldDown(held) {
        this.mouseHeldDown = held;
        if (held) {
            this.mouseHeldDownStart = performance.now();
        }
        mapRenderer.checkMouseHover(this.getWorldMousePosition());
    }
    mouseHeldDownDuration() {
        if (!this.mouseHeldDown)
            return 0;
        return performance.now() - this.mouseHeldDownStart;
    }
    isMouseHeldDown() {
        return this.mouseHeldDown;
    }
    getPlayerPosition() {
        const creature = this.getControlledCreature();
        if (creature) {
            return { x: creature.x, y: creature.y };
        }
        return null;
    }
    loop() {
        this.updateDevInfo();
        if (this.paused) {
            requestAnimationFrame(() => this.loop());
            return;
        }
        const dt = (this.time - this.lastTime) / 1000;
        this.lastTime = this.time;
        secondCounter += dt;
        if (secondCounter >= 1) {
            //console.log("Tiles checked in the last second:", tilesChecked);
            tilesChecked = 0;
            secondCounter = 0;
        }
        while (this.pathRequestQueue.length > 0) {
            if (performance.now() - this.time > this.PATH_REQUEST_BUDGET_PER_FRAME) {
                break; // Stop processing if we've exceeded our time budget for this frame
            }
            const request = this.pathRequestQueue.shift();
            const path = pathfinder.AStar(request.start, request.goal, mapRenderer.getMap(), request.creature);
            if (path) {
                if (request.forHighlight) {
                    mapRenderer.clearPathPrediction();
                    mapRenderer.setPathPrediction(path);
                }
                else {
                    request.creature.setPath(path);
                }
            }
        }
        this.updateMovingCreatures(dt);
        this.updateCreatureVisualPositions(dt);
        this.update(dt);
        effectManager.updateEffects(dt);
        effectManager.renderEffects();
        camera.updateTracking(dt);
        while (this.frameCount.length > 0 && this.frameCount[0] <= this.time - 1000) {
            this.frameCount.shift();
        }
        this.frameCount.push(this.time);
        this.fpsCounter.textContent = this.frameCount.length.toString();
        if (camera.getPrevZoom() !== camera.getZoom()) {
            this.snapCameraToZoom();
            mapRenderer.renderVisibleMap(camera);
            camera.setPrevZoom(camera.getZoom());
        }
        requestAnimationFrame(() => {
            this.time = performance.now();
            this.loop();
        });
    }
    requestPath(start, goal, creature, forHighlight = false) {
        if (this.isInEditorMode())
            return; // Don't allow pathfinding requests in editor mode, as it can interfere with testing and cause unintended consequences
        const creatureId = creature.getIndex();
        if (this.pathRequestQueue.some((req) => req.creature.getIndex() === creatureId)) {
            return; // Already has a pending path request
        }
        const map = creature.getMap();
        if (!map) {
            console.warn("Creature is not on a valid map");
            return;
        }
        this.pathRequestQueue.push({ start, goal, creature, forHighlight });
    }
    updateCreatureVisualPositions(dt) {
        const map = mapRenderer.getMap();
        if (!map)
            return;
        for (const creature of entityManager.getCreaturesOnMap(map.id)) {
            creature.lastMoved += dt;
            const targetScreenX = creature.x * atlas.getTileSize();
            const targetScreenY = creature.y * atlas.getTileSize();
            const currentScreenPos = creature.getScreenPosition();
            creature.setScreenPosition(this.approach(currentScreenPos.x, targetScreenX, this.getAnimationSpeed() * dt), this.approach(currentScreenPos.y, targetScreenY, this.getAnimationSpeed() * dt));
            if (creature.screenX === targetScreenX && creature.screenY === targetScreenY) {
                // if (creature.lastMoved >= 1.5 && creature.getPath().length === 0 && !creature.isPlayerControlled()) {
                // 	const randomTile: { x: number; y: number } = {
                // 		x: creature.x + Math.floor(Math.random() * 12) - 6,
                // 		y: creature.y + Math.floor(Math.random() * 12) - 6,
                // 	};
                // 	this.requestPath({ x: creature.x, y: creature.y }, [randomTile], creature);
                // 	creature.lastMoved = Math.random() * 0.6;
                // }
            }
        }
        mapRenderer.renderCreatures(camera);
    }
    update(dt) {
        let inputX = 0;
        let inputY = 0;
        if (this.keysPressed.has("Control") && (this.keysPressed.has("z") || this.keysPressed.has("Z"))) {
            if (performance.now() - this.lastKeyHeldProcessed >= this.keyHeldInterval) {
                editorHistory.undo(editor.getCurrentState());
                this.setLastKeyHeldProcessed(performance.now());
            }
        }
        if (this.keysPressed.has("Control") && (this.keysPressed.has("y") || this.keysPressed.has("Y"))) {
            if (performance.now() - this.lastKeyHeldProcessed >= this.keyHeldInterval) {
                editorHistory.redo(editor.getCurrentState());
                this.setLastKeyHeldProcessed(performance.now());
            }
        }
        if (this.keysPressed.has("w") || this.keysPressed.has("ArrowUp"))
            inputY -= 1;
        if (this.keysPressed.has("s") || this.keysPressed.has("ArrowDown"))
            inputY += 1;
        if (this.keysPressed.has("a") || this.keysPressed.has("ArrowLeft"))
            inputX -= 1;
        if (this.keysPressed.has("d") || this.keysPressed.has("ArrowRight"))
            inputX += 1;
        if (inputX !== 0 || inputY !== 0) {
            camera.setTracking(null); // Stop tracking when player manually moves the camera
            const length = Math.sqrt(inputX * inputX + inputY * inputY);
            inputX /= length;
            inputY /= length;
            if (this.isInEditorMode() && this.isMouseHeldDown()) {
                {
                    editor.checkTilePaintDrag();
                }
            }
        }
        camera.accelerate(inputX, inputY, dt);
        if (inputX === 0)
            camera.decelerateX(dt);
        if (inputY === 0)
            camera.decelerateY(dt);
        const speed = Math.hypot(camera.getVx(), camera.getVy());
        if (speed > camera.getMaxSpeed()) {
            camera.setVx((camera.getVx() / speed) * camera.getMaxSpeed());
            camera.setVy((camera.getVy() / speed) * camera.getMaxSpeed());
        }
        camera.move(camera.getVx() * dt, camera.getVy() * dt);
    }
    getAnimationSpeed() {
        return 1000 * this.animationSpeedMultiplier; // Base speed is 1000 pixels per second, modified by the multiplier
    }
    getAnimationSpeedMultiplier() {
        return this.animationSpeedMultiplier;
    }
    approach(value, target, delta) {
        if (value < target) {
            return Math.min(value + delta, target);
        }
        if (value > target) {
            return Math.max(value - delta, target);
        }
        return target;
    }
    // This is only for the player
    objectInteractionCheck() {
        const creature = this.getControlledCreature();
        if (!creature)
            return;
        for (const obj of mapRenderer.getMap()?.dynamicObjects ?? []) {
            const objectInteractionTiles = obj.getInteractionTiles();
            const creatureOccupiedArea = creature.getOccupiedArea();
            for (const tile of creatureOccupiedArea) {
                if (objectInteractionTiles.some((t) => t.x === tile[0] && t.y === tile[1])) {
                    console.log(`Interacting with object ${obj.getId()} at (${tile[0]}, ${tile[1]})`);
                    obj.interact(creature);
                }
            }
        }
    }
    snapCameraToZoom() {
        const centreX = this.mouseX;
        const centreY = this.mouseY;
        const worldX = camera.getX() + centreX / camera.getPrevZoom();
        const worldY = camera.getY() + centreY / camera.getPrevZoom();
        camera.setX(worldX - centreX / camera.getZoom());
        camera.setY(worldY - centreY / camera.getZoom());
    }
    updateDevInfo() {
        if (!DEV_MODE.IS_ENABLED)
            return;
        const { x, y } = mapRenderer.getHighlightedTile();
        const hoveredObject = mapRenderer.getMap().getBoundingObjectsAt(x, y)[0];
        const prop = mapRenderer.getHighlightedTilePropData();
        const displayProp = prop && prop.getId() !== "empty";
        this.devInfo.innerHTML = `
			${this.isInEditorMode()
            ? `
			<p>---- EDITING MAP ----</p>
			<p>Map ID: ${mapRenderer.getMap().id}</p>
			<p>Map dimensions: ${mapRenderer.getMap().width}x${mapRenderer.getMap().height}</p>
			`
            : ``}
			<p>---- CAMERA ----</p>
			<p>Screen position: (${camera.getX().toFixed(2)} ${camera.getY().toFixed(2)})</p>
			<p>Map position: (${(camera.getX() / atlas.getTileSize()).toFixed(2)} ${(camera.getY() / atlas.getTileSize()).toFixed(2)})</p>
			<p>Velocity: (${camera.getVx().toFixed(2)}, ${camera.getVy().toFixed(2)})</p>
			<p>Zoom: ${camera.getZoom().toFixed(2)}x</p>
			<p>---- TILE ----</p>
			<p>Hovering tile: (${mapRenderer.getHighlightedTile().x}, ${mapRenderer.getHighlightedTile().y})</p>
			<p>Current Tile: ${mapRenderer.getHighlightedTileData()?.getDebugInfo() ?? "None"}</p>
			${displayProp ? `<p>---- PROP ----</p><p>${prop.getDebugInfo()}</p>` : ""}
			${hoveredObject && hoveredObject.getDebugInfo() ? `<p>---- OBJECT ----</p><p>${hoveredObject.getDebugInfo()}</p>` : ""}
			<p>---- MISC ----</p>
			<p>Mouse: (${this.getWorldMousePosition().x.toFixed(2)} ${this.getWorldMousePosition().y.toFixed(2)})</p>
			<p>Game state: ${GameState[this.state]}</p>
			${!this.isInEditorMode() ? `<p>Path requests in queue: ${this.pathRequestQueue.length}</p>` : ""}
			`;
    }
    updateMousePosition(e) {
        if (!(e.target instanceof HTMLCanvasElement))
            return;
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        const worldPos = this.getWorldMousePosition();
        if (mapRenderer.highlightHasChanged(worldPos)) {
            mapRenderer.checkMouseHover(worldPos);
            if (this.isMouseHeldDown()) {
                editor.checkTilePaintDrag();
                this.selectTile();
                editor.handleClick();
            }
            return;
        }
        mapRenderer.checkMouseHover(worldPos);
    }
    getMousePosition() {
        return { x: this.mouseX, y: this.mouseY };
    }
    getWorldMousePosition() {
        const screenProperties = mapRenderer.getScreenProperties(camera);
        const worldX = screenProperties.cameraX + this.mouseX / camera.getZoom();
        const worldY = screenProperties.cameraY + this.mouseY / camera.getZoom();
        return { x: worldX, y: worldY };
    }
    checkHotkeys(key) {
        if (this.isInEditorMode())
            return; // Disable hotkeys in editor mode to prevent conflicts with editor controls
        if (key === " ") {
            this.togglePause();
        }
        if (key === "r") {
            camera.setTracking(this.getControlledCreature());
        }
        if (key === "e") {
            this.objectInteractionCheck();
        }
    }
    handleClick(worldX, worldY) {
        // const { tileX, tileY } = mapRenderer.getTileCordsByWorldPosition({ x: worldX, y: worldY });
        // console.log(`Clicked on world position (${worldX.toFixed(2)}, ${worldY.toFixed(2)}) which is tile (${tileX}, ${tileY})`);
        // const start: { x: number; y: number } = { x: 0, y: 0 };
        // const goal: { x: number; y: number } = { x: tileX, y: tileY };
        // const path = pathfinder.AStar(start, goal, mapRenderer.getMap(), new Creature({ id: "test_creature" }));
        // console.log("Path found:", path);
    }
    updateMovingCreatures(dt) {
        const map = mapRenderer.getMap();
        if (!map)
            return;
        for (const creature of entityManager.getCreaturesOnMap(map.id)) {
            if (creature.currentPath.length > 0) {
                creature.moveOnPath(dt);
            }
        }
    }
    moveControlledCreature() {
        const creature = this.getControlledCreature();
        if (!creature)
            return;
        if (!this.isControlledCreatureTurn())
            return;
        const goalTile = mapRenderer.getHighlightedTile();
        const creatureAtGoal = entityManager
            .getCreaturesBoundingWithPosition(creature.getMap(), goalTile?.x ?? 0, goalTile?.y ?? 0)
            .find((c) => c._id !== creature._id);
        if (creatureAtGoal) {
            const creatureOccupiedArea = creatureAtGoal.getOccupiedArea();
            const occupation = [];
            for (const tile of creatureOccupiedArea) {
                occupation.push({ x: tile[0], y: tile[1] });
            }
            const newPath = pathfinder.AStar({ x: creature.x, y: creature.y }, occupation, mapRenderer.getMap(), creature);
            creature.setPath(newPath);
            return;
        }
        const path = mapRenderer.getPathPredictionTiles();
        if (path.length === 0)
            return;
        creature.setPath(path);
    }
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
    selectTile() {
        const highlightedTile = mapRenderer.getHighlightedTile();
        if (highlightedTile.x === -1 || highlightedTile.y === -1)
            return;
        if (this.isInEditorMode() && editor.getMode() === EditorMode.select) {
            mapRenderer.setSelectedTile(highlightedTile.x, highlightedTile.y);
        }
    }
    setLastKeyHeldProcessed(timestamp) {
        this.lastKeyHeldProcessed = timestamp;
    }
    isControlledCreatureTurn() {
        if (this.getState() !== GameState.COMBAT)
            return true;
        const creature = this.getControlledCreature();
        if (!creature)
            return false;
        return combatManager.isCreatureTurn(creature);
    }
}
const game = new Game();
game.loop();
window.addEventListener("keydown", (e) => {
    game.getKeysPressed().add(e.key);
});
window.addEventListener("keyup", (e) => {
    game.getKeysPressed().delete(e.key);
    game.checkHotkeys(e.key);
});
// e is actually WheelEvent, but TypeScript doesn't know that
window.addEventListener("mousewheel", (e) => {
    if (!(e.target instanceof HTMLCanvasElement))
        return;
    camera.setZoom(camera.getZoom() - e.deltaY * 0.005);
});
window.addEventListener("mousemove", (e) => {
    game.updateMousePosition(e);
});
window.addEventListener("mousedown", (e) => {
    game.setMouseHeldDown(true);
    if (game.isInEditorMode())
        editor.handleClick();
    if (!(e.target instanceof HTMLCanvasElement))
        return;
    editor.checkTilePaintDrag();
});
window.addEventListener("mouseup", (e) => {
    game.setMouseHeldDown(false);
    if (!(e.target instanceof HTMLCanvasElement))
        return;
    game.moveControlledCreature();
    game.selectTile();
    mapRenderer.clearPathPrediction();
    mapRenderer.renderTileHighlight();
    // const worldPos = game.getWorldMousePosition();
    // game.handleClick(worldPos.x, worldPos.y);
});
//# sourceMappingURL=game.js.map