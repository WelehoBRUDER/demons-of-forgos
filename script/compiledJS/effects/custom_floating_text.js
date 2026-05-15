"use strict";
class CustomFloatingText {
    id;
    x;
    y;
    text;
    opacity = 1;
    fontSize;
    color;
    duration;
    speed;
    constructor(text, x, y, fontSize = 20, color = "white", duration = 2000, speed = 50) {
        console.log(`Creating CustomFloatingText with text: "${text}", position: (${x}, ${y}), fontSize: ${fontSize}, color: ${color}, duration: ${duration}, speed: ${speed}`);
        this.id = "cft";
        this.text = text;
        this.x = x;
        this.y = y;
        this.fontSize = fontSize;
        this.color = color;
        this.duration = duration;
        this.speed = speed;
    }
    update(dt) {
        this.y -= dt * this.speed;
        this.opacity -= dt * (1000 / this.duration);
    }
    render(ctx) {
        const { cameraX, cameraY } = mapRenderer.getScreenProperties(camera);
        const zoom = camera.getZoom();
        const screenX = (this.x - cameraX) * zoom;
        const screenY = (this.y - cameraY) * zoom;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.font = `${this.fontSize * zoom}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(this.text, screenX, screenY);
        ctx.restore();
    }
    isExpired() {
        return this.opacity <= 0;
    }
}
//# sourceMappingURL=custom_floating_text.js.map