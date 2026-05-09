interface TileData {
	id: string;
	texturePath: string;
	isWall?: boolean;
	isWater?: boolean;
	isDrop?: boolean;
	isLowWall?: boolean;
	isDifficultTerrain?: boolean;
	coverLevel?: number;
}

interface TileFlags {
	isWall: boolean; // Tiles you cannot walk on or fly over
	isWater: boolean; // Tiles you can swim or fly over but not walk on
	isDrop: boolean; // Holes, pits etc. that you can fall into but fly over
	isLowWall: boolean; // Tiles that block movement but can be flown over or shot over
	isDifficultTerrain: boolean; // Doubles movement cost for walking
	coverLevel: number; // 0 for no cover, 1 for half cover, 2 for 3/4 cover (full cover can be represented by a wall tile with isWall: true)
}

let tileIndex = 0;
class Tile {
	private _id: number;
	private id: string;
	private texturePath: string;
	private texturePosition: { x: number; y: number };
	private isWall: boolean;
	private isWater: boolean;
	private isDrop: boolean;
	private isLowWall: boolean;
	private isDifficultTerrain: boolean;
	private coverLevel: number;

	constructor(data: TileData) {
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

	getProperties(): TileFlags {
		return {
			isWall: this.isWall,
			isWater: this.isWater,
			isDrop: this.isDrop,
			isLowWall: this.isLowWall,
			isDifficultTerrain: this.isDifficultTerrain, // For now, treat low walls as difficult terrain. This can be expanded in the future if needed.
			coverLevel: this.coverLevel,
		};
	}

	getIndex(): number {
		return this._id;
	}

	getId(): string {
		return this.id;
	}

	getTexturePath(): string {
		return this.texturePath;
	}

	getTexturePosition(): { x: number; y: number } {
		return this.texturePosition;
	}

	setTexturePosition(x: number, y: number) {
		this.texturePosition = { x, y };
	}

	getDebugInfo(): string {
		return `(_INDEX: ${this._id}, ID: ${this.id}, TexturePos: (${this.texturePosition.x}, ${this.texturePosition.y})), Properties: ${JSON.stringify(this.getProperties(), null, 2)}`;
	}
}
