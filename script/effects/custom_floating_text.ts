class CustomFloatingText implements Effect {
	id: string;
	x: number;
	y: number;
	private text: string;
	private opacity: number = 1;
	private fontSize: number;
	private color: string;
	private duration: number;
	private speed: number;

	constructor(
		text: string,
		x: number,
		y: number,
		fontSize: number = 20,
		color: string = "white",
		duration: number = 2000,
		speed: number = 50,
	) {
		console.log(
			`Creating CustomFloatingText with text: "${text}", position: (${x}, ${y}), fontSize: ${fontSize}, color: ${color}, duration: ${duration}, speed: ${speed}`,
		);
		this.id = "cft";
		this.text = text;
		this.x = x;
		this.y = y;
		this.fontSize = fontSize;
		this.color = color;
		this.duration = duration;
		this.speed = speed;
	}

	update(dt: number): void {
		this.y -= dt * this.speed;
		this.opacity -= dt * (1000 / this.duration);
	}

	render(ctx: CanvasRenderingContext2D): void {
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

	isExpired(): boolean {
		return this.opacity <= 0;
	}
}
