interface RawMapData {
	id: string;
	width: number;
	height: number;
	layers: {
		base: string; // Base layer encoded as base64 string
		props: string; // Props layer encoded as base64 string
	};
	objects: DynamicObject[];
}

enum EditorMode {
	select = "select",
	tile = "tile",
	prop = "prop",
	object = "object",
	creature = "creature",
}

interface EditorCommand {
	do(state: EditorState): void;
	undo(state: EditorState): void;
}

interface EditorState {
	objects: DynamicObject[];
	creatures: NPCCreature[];
	tiles: Uint16Array;
	props: Uint16Array;
	brushSize: number;
}

class Editor {
	private MAX_BRUSH_SIZE: number = 7;
	private MIN_BRUSH_SIZE: number = 1;
	private brushSize: number = 1;
	private mode: EditorMode = EditorMode.select;
	private tileBrush: number | null = null; // If null, select mode is active
	private propBrush: number | null = null; // If null, select mode is active
	private objectBrush: string | null = null; // If null, select mode is active
	private creatureBrush: string | null = null; // If null, select mode is active
	private editorInfoPanel: HTMLDivElement = document.querySelector(".editor-info-panel")!;

	private selectedObjects: DynamicObject[] = [];
	private selectedCreature: NPCCreature | null = null;

	constructor() {
		this.updateEditorInfoPanel();
		this.setMode(EditorMode.select); // Start in select mode by default
	}

	getCurrentState(): EditorState {
		return {
			objects: this.getMap().dynamicObjects,
			creatures: entityManager.getCreaturesOnMap(this.getMap().id) as NPCCreature[],
			tiles: this.getMap().layers.base,
			props: this.getMap().layers.props,
			brushSize: this.brushSize,
		};
	}

	setSelectedObjects(objects: DynamicObject[]) {
		this.selectedObjects = objects;
	}

	setBrushSize(size: number) {
		this.brushSize = Math.min(Math.max(size, this.MIN_BRUSH_SIZE), this.MAX_BRUSH_SIZE);
		brushSizeDisplay.textContent = this.brushSize.toString();
	}

	setTileBrush(tileId: number | null) {
		this.resetBrushes({ dontUpdateButtons: true }); // Clear other brushes without updating buttons yet
		this.tileBrush = tileId;
		this.updateButtonStates();
	}

	setPropBrush(propId: number | null) {
		this.resetBrushes({ dontUpdateButtons: true }); // Clear other brushes without updating buttons yet
		this.propBrush = propId;
		this.updateButtonStates();
	}

	setObjectBrush(objectId: string | null) {
		this.resetBrushes({ dontUpdateButtons: true }); // Clear other brushes without updating buttons yet
		this.objectBrush = objectId;
		this.updateButtonStates();
	}

	setCreatureBrush(creatureId: string | null) {
		this.resetBrushes({ dontUpdateButtons: true }); // Clear other brushes without updating buttons yet
		this.creatureBrush = creatureId;
		this.updateButtonStates();
	}

	resetBrushes(options?: { dontUpdateButtons?: boolean }) {
		this.tileBrush = null;
		this.propBrush = null;
		this.objectBrush = null;
		this.creatureBrush = null;
		if (!options?.dontUpdateButtons) {
			this.updateButtonStates();
		}
	}

	getBrushes() {
		return {
			tileBrush: this.tileBrush,
			propBrush: this.propBrush,
			objectBrush: this.objectBrush,
			creatureBrush: this.creatureBrush,
		};
	}

	getMode() {
		return this.mode;
	}

	getBrushSize() {
		if (this.mode === EditorMode.object || this.mode === EditorMode.creature) return 1; // Brush size does not apply to objects or creatures, they are placed one at a time
		return this.brushSize;
	}

	getSelectedObjects(): DynamicObject[] {
		return this.selectedObjects;
	}

	getSelectedCreature(): NPCCreature | null {
		return this.selectedCreature;
	}

	updateButtonStates() {
		if (!modeOptions) return;
		for (const button of modeButtons) {
			button.classList.remove("active");
			if (this.mode === EditorMode.select && button === selectModeButton) {
				button.classList.add("active");
			} else if (this.mode === EditorMode.tile && button === brushModeButton) {
				button.classList.add("active");
			} else if (this.mode === EditorMode.object && button === objectModeButton) {
				button.classList.add("active");
			} else if (this.mode === EditorMode.creature && button === creatureModeButton) {
				button.classList.add("active");
			}
		}
		palette.populatePalette(); // Refresh palette to show selected item
	}

	saveMapToFile() {
		const mapData = this.getEncodedMapData();
		const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(mapData);
		const downloadAnchorNode = document.createElement("a");
		downloadAnchorNode.setAttribute("href", dataStr);
		downloadAnchorNode.setAttribute("download", `${this.getMap().id}.json`);
		document.body.appendChild(downloadAnchorNode);
		downloadAnchorNode.click();
		downloadAnchorNode.remove();
	}

	printToConsole() {
		console.log(this.getEncodedMapData());
	}

	getEncodedMapData(): string {
		const mapData: RawMapData = this.getMap().getStrippedMapData() as any;
		mapData.layers.base = this.encodeLayer(mapData.layers.base as any);
		mapData.layers.props = this.encodeLayer(mapData.layers.props as any);
		return JSON.stringify(mapData);
	}

	encodeLayer(layer: Uint16Array): string {
		return btoa(String.fromCharCode(...new Uint8Array(layer.buffer)));
	}

	decodeLayer(base64: string): Uint16Array {
		const binary = atob(base64);
		const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
		return new Uint16Array(bytes.buffer);
	}

	applyTileBrush(worldX: number, worldY: number, tileIndex: number | null = this.tileBrush, brushSize: number = this.brushSize) {
		const map: WorldMap = this.getMap();
		const halfBrush = Math.floor(brushSize / 2);
		for (let dy = -halfBrush; dy <= halfBrush; dy++) {
			for (let dx = -halfBrush; dx <= halfBrush; dx++) {
				const x = worldX + dx;
				const y = worldY + dy;
				if (map.inBounds(x, y)) {
					map.layers.base[y * map.width + x] = tileIndex;
				}
			}
		}
		mapRenderer.renderVisibleMap(camera); // Re-render to show tile changes immediately
	}

	getBrushTiles(worldX: number, worldY: number, forTile: number, brushSize: number = this.brushSize): affectedTile[] {
		const tiles: affectedTile[] = [];
		const halfBrush = Math.floor(brushSize / 2);
		for (let dy = -halfBrush; dy <= halfBrush; dy++) {
			for (let dx = -halfBrush; dx <= halfBrush; dx++) {
				const x = worldX + dx;
				const y = worldY + dy;
				const tileId: number = this.getMap().layers.base[y * this.getMap().width + x];
				// Only include tiles that are actually changed by the brush
				if (this.getMap().inBounds(x, y) && tileId != forTile) {
					tiles.push({ x, y, before: tileId, after: forTile });
				}
			}
		}
		return tiles;
	}

	applyPropBrush(worldX: number, worldY: number, propIndex: number | null = this.propBrush, brushSize: number = this.brushSize) {
		const map: WorldMap = this.getMap();
		const halfBrush = Math.floor(brushSize / 2);
		for (let dy = -halfBrush; dy <= halfBrush; dy++) {
			for (let dx = -halfBrush; dx <= halfBrush; dx++) {
				const x = worldX + dx;
				const y = worldY + dy;
				if (map.inBounds(x, y)) {
					map.layers.props[y * map.width + x] = propIndex;
				}
			}
		}
		mapRenderer.renderVisibleMap(camera); // Re-render to show tile changes immediately
	}

	handleClick() {
		if (this.mode !== EditorMode.select) return; // Only handle clicks for selection in select mode
		const { tileX, tileY } = mapRenderer.getTileCordsByWorldPosition(game.getWorldMousePosition());
		if (!this.getMap().inBounds(tileX, tileY)) return; // Ignore clicks outside map bounds
		const { x, y } = mapRenderer.getHighlightedTile();
		this.setSelectedObjects(this.getMap().getBoundingObjectsAt(x, y));
		this.setSelectedCreature((entityManager.getCreaturesBoundingWithPosition(this.getMap().id, x, y)[0] as any) || null); // Clear selected creature when clicking on map
		this.updateEditorInfoPanel();
	}

	handleKeyUp(event: KeyboardEvent) {
		if (event.key === "r" || event.key === "R") {
			// Rotate dynamic object if selected
			const selectedObjects = this.getSelectedObjects();
			if (selectedObjects.length > 0) {
				selectedObjects.forEach((obj) => {
					obj.setRotation((obj.getRotation() + 90) % 360);
				});
			}
			mapRenderer.renderObjects(camera); // Re-render to show rotation change
		}
		if (event.key === "Escape") {
			this.resetBrushes();
			this.setSelectedObjects([]);
			this.updateEditorInfoPanel();
			mapRenderer.setSelectedTile(-1, -1); // Clear tile highlight
			mapRenderer.renderVisibleMap(camera); // Re-render to clear any highlights or previews
			objectEditor.close(); // Close object editor if open
		}
	}

	updateEditorInfoPanel() {
		if (!this.editorInfoPanel) return;
		const selectedObjects = this.getSelectedObjects();
		const selectedCreature = this.getSelectedCreature();
		if (selectedCreature) {
			this.editorInfoPanel.innerHTML = `<p>Selected Creature: ${selectedCreature.species}</p>`;
			npcEditor.openForNPC(this.getSelectedCreature()); // Open NPC editor for the selected creature, if any
			return;
		}
		if (selectedObjects.length === 0) {
			this.editorInfoPanel.innerHTML = "<p>No object selected.</p>";
			return;
		}
		objectEditor.openForObject(selectedObjects[0]); // Open object editor for the first selected object
		this.editorInfoPanel.innerHTML = selectedObjects.map((obj) => `<div>${obj.getDetailedInfo()}</div>`).join("");
	}

	getMap(): WorldMap {
		return mapRenderer.getMap();
	}

	getTileBrush() {
		return this.tileBrush;
	}

	getPropBrush() {
		return this.propBrush;
	}

	getObjectBrush() {
		return this.objectBrush;
	}

	getCreatureBrush() {
		return this.creatureBrush;
	}

	checkTilePaintDrag() {
		const { tileX, tileY } = mapRenderer.getTileCordsByWorldPosition(game.getWorldMousePosition());
		if (!this.getMap().inBounds(tileX, tileY)) return; // Ignore drags outside map bounds

		if (this.tileBrush !== null) {
			const brushTiles = this.getBrushTiles(tileX, tileY, this.tileBrush);
			if (brushTiles.length > 0) {
				this.dispatch(new TilePaintCommand(brushTiles));
			}
		} else if (this.propBrush !== null) {
			const brushTiles = this.getBrushTiles(tileX, tileY, this.propBrush);
			if (brushTiles.length > 0) {
				this.dispatch(new PropPaintCommand(brushTiles));
			}
		}

		if (this.objectBrush !== null) {
			const existingObjects = this.getMap().getBoundingObjectsAt(tileX, tileY);
			if (existingObjects.length === 0) {
				const command: EditorCommand = new ObjectPlaceCommand({ i: this.objectBrush, x: tileX, y: tileY, u: null, r: 0 });
				this.dispatch(command);
				mapRenderer.renderObjects(camera); // Re-render to show new object immediately
			}
		}

		if (this.creatureBrush !== null) {
			const existingCreatures = entityManager.getCreaturesBoundingWithPosition(this.getMap().id, tileX, tileY);
			if (existingCreatures.length === 0) {
				// const command: EditorCommand = new NPCPlaceCommand({ i: this.creatureBrush, x: tileX, y: tileY, u: null });
				// this.dispatch(command);
				// mapRenderer.renderObjects(camera); // Re-render to show new object immediately
				const creature = entityManager.getEnemyTemplateById(this.creatureBrush)!;
				const addedCreature = entityManager.addCreature(creature, this.getMap().id, tileX, tileY);
				if (addedCreature) {
					mapRenderer.renderCreatures(camera); // Re-render to show new creature immediately
				} else {
					const { x, y } = game.getMousePosition();
					effectManager.addEffect(new FloatingWarningText("No valid spawn position found for creature!", x, y));
				}
			}
		}
	}

	dispatch(command: EditorCommand) {
		const currentState = this.getCurrentState();
		editorHistory.execute(command, currentState);
		this.updateEditorInfoPanel();
	}

	setMode(mode: EditorMode) {
		if (!this.editorInfoPanel) return;
		this.mode = mode;
		this.resetBrushes();
		this.updateButtonStates();
		modeOptions.style.display = "none";
		brushOptions.style.display = "none";
		brushTitle.style.display = "none";
		if (mode != EditorMode.select) {
			modeOptions.style.display = "block";
			if (mode === EditorMode.tile || mode === EditorMode.prop) {
				brushOptions.style.display = "block";
				brushTitle.style.display = "block";
			}
			this.setSelectedObjects([]);
			this.updateEditorInfoPanel();
			palette.show();
			palette.populatePalette();
			objectEditor.close();
		} else {
			palette.hide();
		}
	}

	setBrushMode(mode: EditorMode) {
		this.setMode(mode);
		if (mode === EditorMode.tile) {
			this.setTileBrush(0); // Default to first tile
		} else if (mode === EditorMode.prop) {
			this.setPropBrush(0); // Default to first prop
		}
	}

	setSelectedCreature(creature: NPCCreature | null) {
		this.selectedCreature = creature;
	}
}

// Global editor instance
const editorPanel: HTMLDivElement = document.querySelector(".editor-panel")!;
const selectModeButton: HTMLButtonElement = editorPanel?.querySelector(".select-mode")!;
const modeOptions: HTMLDivElement = editorPanel?.querySelector(".mode-options")!;

// Brush elements
const brushOptions: HTMLDivElement = modeOptions?.querySelector(".options")!;
const brushTitle: HTMLHeadingElement = modeOptions?.querySelector(".brush-title")!;
const brushModeButton: HTMLButtonElement = editorPanel?.querySelector(".brush-mode")!;
const brushSizeUpButton: HTMLButtonElement = editorPanel?.querySelector(".brush-size-up")!;
const brushSizeDownButton: HTMLButtonElement = editorPanel?.querySelector(".brush-size-down")!;
const brushSizeDisplay: HTMLElement = editorPanel?.querySelector(".brush-size-display")!;
const brushSelect: HTMLSelectElement = editorPanel?.querySelector(".brush-type-select")!;

// Object and creature mode buttons
const objectModeButton: HTMLButtonElement = editorPanel?.querySelector(".object-mode")!;
const creatureModeButton: HTMLButtonElement = editorPanel?.querySelector(".creature-mode")!;

const modeButtons: HTMLButtonElement[] = [selectModeButton, brushModeButton, objectModeButton, creatureModeButton];

selectModeButton?.addEventListener("click", (e) => {
	e.preventDefault();
	editor.setMode(EditorMode.select);
});

brushModeButton?.addEventListener("click", (e) => {
	e.preventDefault();
	editor.setMode(EditorMode.tile);
});

objectModeButton?.addEventListener("click", (e) => {
	e.preventDefault();
	editor.setMode(EditorMode.object);
});

creatureModeButton?.addEventListener("click", (e) => {
	e.preventDefault();
	editor.setMode(EditorMode.creature);
});

brushSelect?.addEventListener("change", (e) => {
	e.preventDefault();
	const selectedValue = brushSelect.value;
	editor.setBrushMode(selectedValue as EditorMode);
});

document.querySelector(".save-to-file")!?.addEventListener("click", (e) => {
	e.preventDefault();
	editor.saveMapToFile();
});

document.querySelector(".load-map")!?.addEventListener("click", (e) => {
	e.preventDefault();
	popUp.showMapLoadList();
});

document.querySelector(".new-map")!?.addEventListener("click", (e) => {
	e.preventDefault();
	popUp.showNewMapOptions();
});

brushSizeUpButton?.addEventListener("click", (e) => {
	e.preventDefault();
	editor.setBrushSize(editor.getBrushSize() + 2);
});

brushSizeDownButton?.addEventListener("click", (e) => {
	e.preventDefault();
	editor.setBrushSize(editor.getBrushSize() - 2);
});

window.addEventListener("keyup", (event) => {
	if (!game.isInEditorMode()) return;
	editor.handleKeyUp(event);
});

const editor = new Editor();
