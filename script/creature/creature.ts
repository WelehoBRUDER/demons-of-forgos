interface CreatureInterface {
	id: string;
	x?: number;
	y?: number;
	map?: string;
	faction?: number;
	sizeCategory?: string;
	uid?: string;
	hp?: number;
}

interface StrippedCreatureData {
	i: string;
	u: string;
	x: number;
	y: number;
}

// Movement constants
const BLOCKED = 0;
const NORMAL = 1;

// Faction constants
const HOSTILE = 0;
const NEUTRAL = 1;
const FRIENDLY = 2;

interface TilePropertyInteractions {
	isWater: number; // 0 means impeded, 1 means normal
	isLowWall: number; // 0 means impeded, 1 means normal
	isDrop: number; // 0 means impeded, 1 means normal
	isDifficultTerrain: number; // 0 means impeded, 1 means normal
}

let creatureIndex = 0;
class Creature implements CreatureInterface {
	_id: number;
	id: string;
	uid: string;
	x: number;
	y: number;
	screenX: number = 0; // For smooth movement, this will be updated gradually towards x
	screenY: number = 0; // For smooth movement, this will be updated gradually towards y
	baseClass: string = "Creature";
	lastMoved: number = 0;
	map: string; // ID pointing to the map the creature is on, set when added to map
	faction: number = NEUTRAL; // 0 = hostile, 1 = neutral, 2 = friendly. This can be used for AI behavior and targeting.
	sizeCategory: string = "medium";
	currentPath: { x: number; y: number }[] = [];
	visualOffsetX: number = 0; // For smooth movement, this will be updated gradually towards 0
	visualOffsetY: number = 0; // For smooth movement, this will be updated gradually towards 0

	hp: number = 4;
	constructor(data: CreatureInterface) {
		this._id = creatureIndex++; // Assign a unique ID to each creature
		this.id = data.id;
		this.x = data.x ?? -1;
		this.y = data.y ?? -1;
		this.map = data.map ?? "";
		this.faction = data.faction ?? NEUTRAL;
		this.sizeCategory = data.sizeCategory ?? "medium";
		this.screenX = this.x;
		this.screenY = this.y;
		this.lastMoved = Math.random();
		this.hp = data.hp ?? this.getMaxHP();
		this.uid = data.uid ?? null; // UID will be set when the creature is added to the map
	}

	restoreStrippedData(data: StrippedCreatureData) {
		this.setUID(data.u);
		this.setPosition(data.x, data.y);
	}

	getUID(): string {
		return this.uid;
	}

	setUID(uid: string) {
		this.uid = uid;
	}

	setId(id: number) {
		this._id = id;
	}

	isPlayerControlled(): boolean {
		return game.getControlledCreatureId() === this.uid;
	}

	getTemplateId(): string {
		return this.id;
	}

	setMap(mapId: string) {
		this.map = mapId;
	}

	setFaction(faction: number) {
		this.faction = faction;
	}

	getIndex(): number {
		return this._id;
	}

	getBaseClass(): string {
		return this.baseClass;
	}

	getMap(): string {
		return this.map;
	}

	getFaction(): number {
		return this.faction;
	}

	setPosition(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.screenX = x * atlas.getTileSize();
		this.screenY = y * atlas.getTileSize();
	}

	setX(x: number) {
		this.x = x;
		this.screenX = x * atlas.getTileSize();
	}

	setY(y: number) {
		this.y = y;
		this.screenY = y * atlas.getTileSize();
	}

	// This function should only be called for testing.
	// For actual gameplay, use a random wandering behavior or player-controlled movement instead.
	moveRandomly() {
		if (this.isPlayerControlled()) return;
		const directions = [
			{ dx: 0, dy: -1 }, // Up
			{ dx: 0, dy: 1 }, // Down
			{ dx: -1, dy: 0 }, // Left
			{ dx: 1, dy: 0 }, // Right
			{ dx: -1, dy: -1 }, // Up-Left
			{ dx: 1, dy: -1 }, // Up-Right
			{ dx: -1, dy: 1 }, // Down-Left
			{ dx: 1, dy: 1 }, // Down-Right
			{ dx: 0, dy: 0 }, // Stay in place
		];
		const randomDirection = directions[Math.floor(Math.random() * directions.length)];
		const newX = this.x + randomDirection.dx;
		const newY = this.y + randomDirection.dy;
		// Check bounds and tile properties before moving
		const cost = pathfinder.costToEnter(newX, newY, mapRenderer.getMap(), this, this.getSizeCategory());
		//console.log(`Creature ${this.id} attempting to move to (${newX}, ${newY}) with movement cost:`, cost);
		if (cost !== Infinity) {
			this.move(newX, newY);
		}
	}

	getSizeCategoryId(): string {
		return this.sizeCategory;
	}

	getSizeCategory(): number {
		return sizeCategories[this.sizeCategory] || sizeCategories.medium;
	}

	getOccupiedArea(): number[][] {
		const box: number[][] = [];
		const size = this.getSizeCategory();

		// Tiny creatures don't occupy a full tile
		if (size < 0.75) {
			return box;
		}

		// Small and medium creatures occupy the tile they are directly standing on (by x and y coordinates)
		if (size <= 1) {
			return [[this.x, this.y]];
		}

		// Large and huge creatures occupy multiple tiles in a square area based on their size category

		// Size is always symmetrical, ie 1x1, 2x2, 3x3 etc.
		for (let dx = 0; dx < size; dx++) {
			for (let dy = 0; dy < size; dy++) {
				box.push([this.x + dx, this.y + dy]);
			}
		}

		return box;
	}

	setScreenPosition(x: number, y: number) {
		this.screenX = x;
		this.screenY = y;
	}

	getScreenPosition(): { x: number; y: number } {
		return { x: this.screenX, y: this.screenY };
	}

	getCenterScreenPosition(): { x: number; y: number } {
		const offset = (this.getSizeCategory() * atlas.getTileSize()) / 2;
		return { x: this.screenX + offset, y: this.screenY + offset };
	}

	getPosition(): { x: number; y: number } {
		return { x: this.x, y: this.y };
	}

	move(newX: number, newY: number) {
		this.x = newX;
		this.y = newY;
		//mapRenderer.renderVisibleMap(camera); // Re-render the map to reflect the creature's new position
	}

	getHP(): number {
		return this.hp;
	}

	takeDamage(amount: number) {
		this.hp -= amount;
		if (this.hp <= 0) {
			//this.die();
		}
	}

	setHP(amount: number) {
		this.hp = amount;
	}

	getMaxHP(): number {
		return 4; // For simplicity, all creatures have the same max HP for now
	}

	getHpPercentage(): number {
		return Math.max(0, this.hp / this.getMaxHP());
	}

	getMoveSpeed(): number {
		return 6; // Default movement is 6 tiles per action.
	}

	getFlySpeed(): number {
		return 0; // Flight must be specified by creature stat block.
	}

	getHoverSpeed(): number {
		return 0; // Hovering must be specified by creature stat block.
	}

	// isWall will always block movement, as it is explicitly an enclosed barrier.
	getTilePropertyInteractions(): TilePropertyInteractions {
		// 0 means impeded, 1 means normal
		// The return value could also be a weight for pathfinding depending on the speed
		return {
			isWater: this.getFlySpeed() === 0 ? BLOCKED : NORMAL,
			isLowWall: this.getHoverSpeed() === 0 ? BLOCKED : NORMAL,
			isDrop: this.getFlySpeed() === 0 ? BLOCKED : NORMAL,
			isDifficultTerrain: BLOCKED, // This can be explicitly changed for creatures that are unaffected by difficult terrain.
		};
	}

	moveOnPath(dt: number) {
		this.handleMovementAnimation(dt);
		if (this.currentPath.length === 0 || !this.hasFinishedMoving()) return;
		const nextTile = this.currentPath.shift();
		if (nextTile) {
			const cost = pathfinder.costToEnter(nextTile.x, nextTile.y, mapRenderer.getMap(), this, this.getSizeCategory());
			/* Something is blocking the path */
			if (cost === Infinity) {
				const goal = mapRenderer.getPathPredictionGoal();
				this.currentPath = []; // Clear the path if the next tile is no longer passable
				if (goal) {
					game.requestPath({ x: this.x, y: this.y }, [goal], this);
				}
				return;
			}
			this.move(nextTile.x, nextTile.y);
		}
	}

	setVisualOffset(x: number, y: number) {
		this.visualOffsetX = x;
		this.visualOffsetY = y;
	}

	getVisualOffset(): { x: number; y: number } {
		return { x: this.visualOffsetX, y: this.visualOffsetY };
	}

	handleMovementAnimation(dt: number) {
		const progress = this.movementProgressToNextTile();
		const { x, y } = this.getVisualOffset();
		const walkBob: number = 10; // How many pixels the creature bobs
		const offsetY = Math.sin(progress * Math.PI) * walkBob; // Bob up and down in a sine wave pattern for a smooth walking animation
		this.setVisualOffset(x, offsetY);
	}

	movementProgressToNextTile(): number {
		const targetScreenX = this.x * atlas.getTileSize();
		const targetScreenY = this.y * atlas.getTileSize();
		const dx = targetScreenX - this.screenX;
		const dy = targetScreenY - this.screenY;
		const distanceToNextTile = Math.sqrt(dx * dx + dy * dy);
		const totalDistance = atlas.getTileSize();
		return 1 - distanceToNextTile / totalDistance; // Returns a value between 0 and 1 indicating progress towards the next tile
	}

	hasFinishedMoving(): boolean {
		return this.movementProgressToNextTile() >= 1; // Consider movement finished when the creature has reached or passed the target tile
	}

	setPath(path: { x: number; y: number }[]) {
		this.currentPath = path;
	}

	getPath(): { x: number; y: number }[] {
		return this.currentPath;
	}

	getStrippedData(): StrippedCreatureData {
		return {
			i: this.id,
			u: this.uid,
			x: this.x,
			y: this.y,
		};
	}
}

const creatures: Creature[] = [];
