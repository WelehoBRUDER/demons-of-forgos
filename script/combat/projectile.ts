class Projectile {
	start: Coordinate;
	position: Coordinate;
	direction: Coordinate;
	impact: Coordinate | null = null;
	base: ProjectileBase | null = null;

	constructor(start: Coordinate, direction: Coordinate, base: ProjectileBase | null = null) {
		this.start = start;
		this.position = { ...start };
		this.direction = direction;
		this.base = base;
	}
}

class ProjectileBase {
	id: string;
	spritePath: string;
	spritePosition: { x: number; y: number };
	speed: number;
	constructor(id: string, spritePath: string, speed: number) {
		this.id = id;
		this.spritePath = spritePath;
		this.spritePosition = { x: -1, y: -1 }; // Will be set when added to the atlas
		this.speed = speed;
	}

	getId(): string {
		return this.id;
	}

	getSpritePosition(): { x: number; y: number } {
		return this.spritePosition;
	}

	getSpeed(): number {
		return this.speed;
	}

	setSpritePosition(x: number, y: number) {
		this.spritePosition = { x, y };
	}
}

class ProjectileManager {
	projectiles: Map<string, ProjectileBase> = new Map();

	addProjectileBase(projectile: ProjectileBase) {
		this.projectiles.set(projectile.getId(), projectile);
	}

	getProjectileBase(id: string): ProjectileBase | undefined {
		return this.projectiles.get(id);
	}

	getAllProjectileBases(): ProjectileBase[] {
		return Array.from(this.projectiles.values());
	}
}

const projectileManager = new ProjectileManager();
