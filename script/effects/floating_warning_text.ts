class FloatingWarningText implements Effect {
	x: number;
	y: number;
	private text: string;
	private opacity: number = 1;

	constructor(text: string, x: number, y: number) {
		this.text = text;
		this.x = x;
		this.y = y;
	}

	update(dt: number): void {
		this.y -= dt * 50;
		this.opacity -= dt * 0.5;
	}

	render(ctx: CanvasRenderingContext2D): void {
		ctx.save();
		ctx.globalAlpha = this.opacity;
		ctx.fillStyle = "red";
		ctx.font = "20px Arial";
		ctx.textAlign = "center";
		ctx.fillText(this.text, this.x, this.y);
		ctx.restore();
	}

	isExpired(): boolean {
		return this.opacity <= 0;
	}
}
