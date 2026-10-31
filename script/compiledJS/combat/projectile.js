"use strict";
class Projectile {
    start;
    position;
    target;
    impact = null;
    base = null;
    traveledDistance = 0;
    // Calculate the total distance to the target
    totalDistance = 0;
    dirX = 0;
    dirY = 0;
    rotation = 0; // Angle in radians for rendering the projectile's orientation
    constructor(base = null, start, target) {
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
    move(dt) {
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
        }
        else {
            // Move along the unit direction vector
            this.position.x += this.dirX * step;
            this.position.y += this.dirY * step;
        }
    }
    launch() {
        return new Promise((resolve) => {
            const checkIfResolved = () => {
                if (this.impact) {
                    resolve();
                }
                else {
                    requestAnimationFrame(() => checkIfResolved()); // Assuming 60 FPS
                }
            };
            requestAnimationFrame(() => checkIfResolved());
        });
    }
    getRotation() {
        return this.rotation;
    }
}
class ProjectileBase {
    id;
    spritePath;
    spritePosition;
    speed;
    constructor(id, spritePath, speed) {
        this.id = id;
        this.spritePath = spritePath;
        this.spritePosition = { x: -1, y: -1 }; // Will be set when added to the atlas
        this.speed = speed;
    }
    getId() {
        return this.id;
    }
    getSpritePosition() {
        return this.spritePosition;
    }
    getSpeed() {
        return this.speed;
    }
    setSpritePosition(x, y) {
        this.spritePosition = { x, y };
    }
}
class ProjectileManager {
    projectiles = new Map();
    spawnedProjectiles = [];
    async spawnProjectile(start, target, baseId) {
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
    getAllSpawnedProjectiles() {
        return this.spawnedProjectiles;
    }
    addProjectileBase(projectile) {
        this.projectiles.set(projectile.getId(), projectile);
    }
    getProjectileBase(id) {
        return this.projectiles.get(id);
    }
    getAllProjectileBases() {
        return Array.from(this.projectiles.values());
    }
    updateProjectiles(dt) {
        for (const projectile of this.spawnedProjectiles) {
            projectile.move(dt);
        }
    }
}
const projectileManager = new ProjectileManager();
//# sourceMappingURL=projectile.js.map