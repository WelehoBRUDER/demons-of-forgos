"use strict";
class FloatingWarningText {
    id;
    x;
    y;
    text;
    opacity = 1;
    constructor(text, x, y) {
        this.id = "fwt";
        this.text = text;
        this.x = x;
        this.y = y;
    }
    update(dt) {
        this.y -= dt * 50;
        this.opacity -= dt * 0.5;
    }
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = "red";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
    isExpired() {
        return this.opacity <= 0;
    }
}
//# sourceMappingURL=floating_warning_text.js.map