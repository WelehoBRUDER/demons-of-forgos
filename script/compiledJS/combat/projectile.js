"use strict";
class Projectile {
    start;
    position;
    direction;
    impact = null;
    constructor(start, direction) {
        this.start = start;
        this.position = { ...start };
        this.direction = direction;
    }
}
//# sourceMappingURL=projectile.js.map