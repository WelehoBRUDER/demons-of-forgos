interface Effect {
	x: number;
	y: number;
	update(dt: number): void;
	render(ctx: CanvasRenderingContext2D): void;
	isExpired(): boolean;
}
