"use strict";
class Camera {
    vx = 0;
    vy = 0;
    x;
    y;
    targetX = 0;
    targetY = 0;
    maxSpeed = 1500; // pixels per second
    acceleration = 9000; // pixels per second squared
    friction = 4000; // friction coefficient
    zoom;
    prevZoom = 1;
    minZoom = 0.5;
    maxZoom = 3;
    trackingTarget = null;
    constructor(x = 0, y = 0, zoom = 1) {
        this.vx = 0;
        this.vy = 0;
        this.x = x;
        this.y = y;
        this.zoom = zoom;
    }
    getVx() {
        return this.vx;
    }
    getVy() {
        return this.vy;
    }
    getX() {
        return Math.floor(this.x);
    }
    getY() {
        return Math.floor(this.y);
    }
    getZoom() {
        return this.zoom;
    }
    getMaxSpeed() {
        return this.maxSpeed;
    }
    getPrevZoom() {
        return this.prevZoom;
    }
    setVx(vx) {
        this.vx = vx;
    }
    setVy(vy) {
        this.vy = vy;
    }
    setX(x) {
        this.x = x;
    }
    setY(y) {
        this.y = y;
    }
    move(dx, dy) {
        const prevX = this.x;
        const prevY = this.y;
        this.x += dx;
        this.y += dy;
        this.snapToBounds();
        if (prevX !== this.x || prevY !== this.y) {
            mapRenderer.checkMouseHover(game.getWorldMousePosition());
            mapRenderer.renderVisibleMap(this);
        }
    }
    accelerate(ax, ay, dt) {
        this.vx += ax * this.acceleration * dt;
        this.vy += ay * this.acceleration * dt;
    }
    decelerateX(dt) {
        this.vx = game.approach(this.vx, 0, this.friction * dt);
    }
    decelerateY(dt) {
        this.vy = game.approach(this.vy, 0, this.friction * dt);
    }
    snapToBounds() {
        if (this.x < 0)
            this.x = 0;
        if (this.y < 0)
            this.y = 0;
        const { fullWidth, fullHeight } = mapRenderer.getTotalMapSize();
        const { viewportWidth, viewportHeight } = mapRenderer.getViewportSize();
        if (fullWidth < viewportWidth) {
            this.x = -(viewportWidth - fullWidth) / 2;
        }
        else {
            this.x = game.clamp(this.x, 0, fullWidth - viewportWidth);
        }
        if (fullHeight < viewportHeight) {
            this.y = -(viewportHeight - fullHeight) / 2;
        }
        else {
            this.y = game.clamp(this.y, 0, fullHeight - viewportHeight);
        }
    }
    setZoom(zoom) {
        if (game.isPaused())
            return; // Prevent zooming while paused
        if (zoom < this.minZoom)
            zoom = this.minZoom;
        if (zoom > this.maxZoom)
            zoom = this.maxZoom;
        this.prevZoom = this.zoom;
        this.zoom = zoom;
        console.log(`Zoom set to: ${this.zoom.toFixed(2)}`);
    }
    // Not working yet
    panTo(x, y) {
        this.targetX = x;
        this.targetY = y;
    }
    setPrevZoom(zoom) {
        this.prevZoom = zoom;
    }
    setTracking(target) {
        this.trackingTarget = target;
    }
    updateTracking(dt) {
        if (!this.trackingTarget)
            return;
        const snappiness = 6; // Adjust this value for smoother or snappier tracking
        const targetPos = this.trackingTarget.getCenterScreenPosition();
        const centerX = this.x + window.innerWidth / (2 * this.zoom);
        const centerY = this.y + window.innerHeight / (2 * this.zoom);
        const dx = targetPos.x - centerX;
        const dy = targetPos.y - centerY;
        this.move(dx * dt * snappiness, dy * dt * snappiness);
    }
}
const camera = new Camera();
//# sourceMappingURL=camera.js.map