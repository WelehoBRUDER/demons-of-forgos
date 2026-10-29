"use strict";
class Projectile {
    start;
    position;
    direction;
    impact = null;
    base = null;
    constructor(start, direction, base = null) {
        this.start = start;
        this.position = { ...start };
        this.direction = direction;
        this.base = base;
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
    addProjectileBase(projectile) {
        this.projectiles.set(projectile.getId(), projectile);
    }
    getProjectileBase(id) {
        return this.projectiles.get(id);
    }
    getAllProjectileBases() {
        return Array.from(this.projectiles.values());
    }
}
const projectileManager = new ProjectileManager();
//# sourceMappingURL=projectile.js.map