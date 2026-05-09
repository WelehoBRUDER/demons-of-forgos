interface DynamicObjectData extends TileData {
	state?: number;
	states: string[];
	width: number; // Width in tiles
	height: number; // Height in tiles
	type: ObjectType; // Type of dynamic object, e.g. "door", "trap", etc.
	skipRender?: boolean; // Whether this object should be rendered on the map (useful for invisible objects like spawn points)
	rotation?: number; // Rotation in degrees (0, 90, 180, 270)
	stateTextures?: string[]; // Optional array of texture paths corresponding to each state, if the texture changes with state
	interactionRange?: number; // Optional range for interactions, if different from the default of 1 tile
	isLockedDoor?: boolean; // Optional property to indicate if a door is locked, relevant for door-type dynamic objects
	requiredKeyId?: string; // Optional property to specify a required key ID for unlocking, relevant for locked doors
	unlockDC?: number; // Optional property to specify a DC for unlocking the object, relevant for locked doors
}

// Constant object states for consistent reference.
const DOOR_CLOSED: string = "door_closed";
const DOOR_OPEN: string = "door_open";

enum ObjectType {
	door = "door",
	spawnPoint = "spawn_point",
}

enum EditorDataOptionType {
	slider = "slider",
	checkbox = "checkbox",
	dropdown = "dropdown",
	textInput = "textInput",
	numberInput = "numberInput",
}

// Locked types can be edited if explicitly unlocked in the editor.
interface EditorDynamicData {
	value: any;
	setValue: string; // Key that maps to setter function on the DynamicObject, e.g. "rotation" would map to setRotation() method
	locked: boolean; // Whether this option should be locked (uneditable) based on the current state of the object
	optionType: EditorDataOptionType;
	optionValues?: any[]; // For dropdowns, the list of possible values, for sliders min - max values, etc.
}

// Dynamic objects are tiles that can change during gameplay, such as doors that can open and close, or traps that can be triggered. They have the same properties as regular tiles, but their state can be modified by game events.
class DynamicObject extends Tile {
	private state: number;
	private states: string[];
	private width: number = 1; // Default width of 1 tile
	private height: number = 1; // Default height of 1 tile
	private rotation: number = 0; // Rotation in degrees (0, 90, 180, 270)
	private stateTextures: string[]; // Optional array of texture paths for each state
	private stateTexturePositions: { x: number; y: number }[] = []; // Texture atlas positions for each state
	private interactionRange: number = 1; // Default interaction range of 1 tile
	private uid: string; // Unique identifier for the dynamic object, used for saving/loading and referencing in the map
	private x: number = -1;
	private y: number = -1;
	private type: ObjectType;
	private isLockedDoor: boolean = false; // Only relevant for door-type dynamic objects
	private requiredKeyId: string | null = null; // Only relevant for locked doors
	private unlockDC: number | null = null; // Only relevant for locked doors
	private skipRender: boolean = false; // Whether this object should be rendered on the map
	constructor(data: DynamicObjectData) {
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

	setIsLockedDoor(isLocked: boolean) {
		this.isLockedDoor = isLocked;
	}
	setRequiredKeyId(keyId: string) {
		this.requiredKeyId = keyId;
	}

	setUnlockDC(dc: number) {
		this.unlockDC = dc;
	}

	shouldSkipRender(): boolean {
		return this.skipRender;
	}

	getEditorDynamicData(): { [key: string]: EditorDynamicData } {
		let objectSpecificData: { [key: string]: EditorDynamicData } = {};
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

	getUID(): string {
		return this.uid;
	}

	setUID(uid: string) {
		this.uid = uid;
	}

	getState(): number {
		return this.state;
	}

	setState(newState: number) {
		if (newState < 0 || newState >= this.states.length) {
			throw new Error(`Invalid state index ${newState} for dynamic object with id ${this.getId()}`);
		}
		this.state = newState;
		mapRenderer.renderObjects(camera); // Re-render objects to reflect state change
	}

	getCurrentStateId(): string {
		return this.states[this.state];
	}

	getWidth(): number {
		return this.rotation === 0 || this.rotation === 180 ? this.width : this.height;
	}

	getHeight(): number {
		return this.rotation === 0 || this.rotation === 180 ? this.height : this.width;
	}

	getUnrotatedDimensions(): { width: number; height: number } {
		return { width: this.width, height: this.height };
	}

	getRotation(): number {
		return this.rotation;
	}

	getStateTextures(): string[] {
		return this.stateTextures;
	}

	getStateTexturePositions(): { x: number; y: number }[] {
		return this.stateTexturePositions;
	}

	getInteractionRange(): number {
		return this.interactionRange;
	}

	getTexturePosition(): { x: number; y: number } {
		return this.getStateTexturePositions()[this.getState()] || { x: -1, y: -1 };
	}

	setRotation(rotation: number) {
		if (![0, 90, 180, 270].includes(rotation)) {
			throw new Error(
				`Invalid rotation value ${rotation} for dynamic object with id ${this.getId()}. Rotation must be one of 0, 90, 180, or 270 degrees.`,
			);
		}
		this.rotation = rotation;
	}

	setStateTexturePosition(stateIndex: number, x: number, y: number) {
		if (stateIndex < 0 || stateIndex >= this.states.length) {
			throw new Error(`Invalid state index ${stateIndex} for dynamic object with id ${this.getId()}`);
		}
		this.stateTexturePositions[stateIndex] = { x, y };
	}

	setPosition(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	setX(x: number) {
		this.x = x;
	}

	setY(y: number) {
		this.y = y;
	}

	getPosition(): { x: number; y: number } {
		return { x: this.x, y: this.y };
	}

	getTileProperties(): TileFlags {
		const properties: TileFlags = {
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

	getBoundingTiles(): { x: number; y: number }[] {
		const tiles: { x: number; y: number }[] = [];
		const pos = this.getPosition();
		const width = this.getWidth();
		const height = this.getHeight();
		if (width === 1 && height === 1) return [pos]; // Optimization for common case of 1x1 objects
		for (let dx = 0; dx < width; dx++) {
			for (let dy = 0; dy < height; dy++) {
				tiles.push({ x: pos.x + dx, y: pos.y + dy });
			}
		}
		return tiles;
	}

	getInteractionTiles(): { x: number; y: number }[] {
		const tiles: { x: number; y: number }[] = [];
		const pos = this.getPosition();
		const range = this.getInteractionRange();
		const width = this.getWidth();
		const height = this.getHeight();
		for (let dx = -range; dx <= width - 1 + range; dx++) {
			for (let dy = -range; dy <= height - 1 + range; dy++) {
				// exclude tiles that are within the object's own area, since those are not interaction tiles
				if (dx >= 0 && dx < width && dy >= 0 && dy < height) continue;
				tiles.push({ x: pos.x + dx, y: pos.y + dy });
			}
		}
		return tiles;
	}

	getTextureSize(): { width: number; height: number } {
		const tileSize = atlas.getTileSize();
		const width: number = this.width;
		const height: number = this.height;
		return { width: width * tileSize, height: height * tileSize };
	}

	interact(creature: Creature) {
		const creaturesInsideObject: Creature[] = entityManager.getCreaturesBoundingWithArea(creature.getMap(), this.getBoundingTiles());
		if (this.getCurrentStateId() === DOOR_CLOSED && creaturesInsideObject.length === 0) {
			this.setState(this.states.indexOf(DOOR_OPEN));
		} else if (this.getCurrentStateId() === DOOR_OPEN && creaturesInsideObject.length === 0) {
			this.setState(this.states.indexOf(DOOR_CLOSED));
		}
	}

	restoreStrippedData(data: StrippedObjectData) {
		this.setUID(data.u);
		this.setRotation(data.r);
		this.setPosition(data.x, data.y);
	}

	getStrippedData(): StrippedObjectData {
		return {
			i: this.getId(),
			u: this.getUID(),
			r: this.getRotation(),
			x: this.getPosition().x,
			y: this.getPosition().y,
		};
	}

	getDebugInfo(): string {
		const baseInfo: string = super.getDebugInfo();
		const objectInfo: string = `State: ${this.getCurrentStateId()}, Rotation: ${this.rotation} degrees, Interaction Range: ${this.interactionRange}, Is Locked Door: ${this.isLockedDoor}`;
		return `UID: ${this.uid}, ${baseInfo}, ${objectInfo}`;
	}

	// This is mainly used by the map editor
	getDetailedInfo(): string {
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
