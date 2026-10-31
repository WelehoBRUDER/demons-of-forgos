class Projectile {
	start: Coordinate;
	position: Coordinate;
	target: Coordinate;
	impact: Coordinate | null = null;
	base: ProjectileBase | null = null;
	traveledDistance: number = 0;
	// Calculate the total distance to the target
	totalDistance: number = 0;
	dirX: number = 0;
	dirY: number = 0;
	rotation: number = 0; // Angle in radians for rendering the projectile's orientation

	constructor(base: ProjectileBase | null = null, start: Coordinate, target: Coordinate) {
		this.start = start;
		this.position = { ...start }; // Initialize position to the starting coordinate
		console.log(`Projectile starting position: (${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)})`);
		console.log(`Projectile starting world position: (${this.start.x.toFixed(2)}, ${this.start.y.toFixed(2)})`);
		this.target = target;
		this.base = base;
		this.totalDistance = Math.hypot(target.x - start.x, target.y - start.y);
		if (this.totalDistance > 0) {
			this.dirX = (target.x - start.x) / this.totalDistance;
			this.dirY = (target.y - start.y) / this.totalDistance;
		}
		this.rotation = Math.atan2(this.dirY, this.dirX); // Calculate the angle for rendering
	}

	move(dt: number) {
		if (!this.base) {
			console.error("Projectile base is not defined.");
			return;
		}

		// Speed is units per second. Multiply by dt for frame-independent movement.
		const step = this.base.getSpeed() * dt;
		this.traveledDistance += step;

		if (this.traveledDistance >= this.totalDistance) {
			// Snap to target and trigger impact when reached
			this.position = { ...this.target };
			this.impact = { ...this.target };
			console.log(`Projectile reached target at: (${this.position.x.toFixed(2)}, ${this.position.y.toFixed(2)})`);
		} else {
			// Move along the unit direction vector
			this.position.x += this.dirX * step;
			this.position.y += this.dirY * step;
		}
	}

	launch(): Promise<void> {
		return new Promise((resolve) => {
			const checkIfResolved = () => {
				if (this.impact) {
					resolve();
				} else {
					requestAnimationFrame(() => checkIfResolved()); // Assuming 60 FPS
				}
			};
			requestAnimationFrame(() => checkIfResolved());
		});
	}

	getRotation(): number {
		return this.rotation;
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
	spawnedProjectiles: Projectile[] = [];

	async spawnProjectile(start: Coordinate, target: Coordinate, baseId: string): Promise<Projectile | null> {
		const base = this.getProjectileBase(baseId);
		if (!base) {
			console.error(`Projectile base with ID "${baseId}" not found.`);
			return null;
		}
		const projectile = new Projectile(base, start, target);
		this.spawnedProjectiles.push(projectile);

		await projectile.launch();

		// Remove the projectile from the spawned list after it has completed its launch
		const index = this.spawnedProjectiles.indexOf(projectile);
		if (index > -1) {
			this.spawnedProjectiles.splice(index, 1);
		}

		return new Promise((resolve) => {
			resolve(projectile);
		});
	}

	getAllSpawnedProjectiles(): Projectile[] {
		return this.spawnedProjectiles;
	}

	addProjectileBase(projectile: ProjectileBase) {
		this.projectiles.set(projectile.getId(), projectile);
	}

	getProjectileBase(id: string): ProjectileBase | undefined {
		return this.projectiles.get(id);
	}

	getAllProjectileBases(): ProjectileBase[] {
		return Array.from(this.projectiles.values());
	}

	updateProjectiles(dt: number) {
		for (const projectile of this.spawnedProjectiles) {
			projectile.move(dt);
		}
	}
}

const projectileManager = new ProjectileManager();
