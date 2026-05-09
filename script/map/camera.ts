class Camera {
	private vx: number = 0;
	private vy: number = 0;
	private x: number;
	private y: number;
	private targetX: number = 0;
	private targetY: number = 0;
	private maxSpeed: number = 1500; // pixels per second
	private acceleration: number = 9000; // pixels per second squared
	private friction: number = 4000; // friction coefficient
	private zoom: number;
	private prevZoom: number = 1;
	private minZoom: number = 0.5;
	private maxZoom: number = 3;
	private trackingTarget: Creature | null = null;

	constructor(x: number = 0, y: number = 0, zoom: number = 1) {
		this.vx = 0;
		this.vy = 0;
		this.x = x;
		this.y = y;
		this.zoom = zoom;
	}

	getVx(): number {
		return this.vx;
	}

	getVy(): number {
		return this.vy;
	}

	getX(): number {
		return Math.floor(this.x);
	}

	getY(): number {
		return Math.floor(this.y);
	}

	getZoom(): number {
		return this.zoom;
	}

	getMaxSpeed(): number {
		return this.maxSpeed;
	}

	getPrevZoom(): number {
		return this.prevZoom;
	}

	setVx(vx: number) {
		this.vx = vx;
	}

	setVy(vy: number) {
		this.vy = vy;
	}

	setX(x: number) {
		this.x = x;
	}

	setY(y: number) {
		this.y = y;
	}

	move(dx: number, dy: number) {
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

	accelerate(ax: number, ay: number, dt: number): void {
		this.vx += ax * this.acceleration * dt;
		this.vy += ay * this.acceleration * dt;
	}

	decelerateX(dt: number): void {
		this.vx = game.approach(this.vx, 0, this.friction * dt);
	}

	decelerateY(dt: number): void {
		this.vy = game.approach(this.vy, 0, this.friction * dt);
	}

	snapToBounds(): void {
		if (this.x < 0) this.x = 0;
		if (this.y < 0) this.y = 0;
		const { fullWidth, fullHeight } = mapRenderer.getTotalMapSize();
		const { viewportWidth, viewportHeight } = mapRenderer.getViewportSize();

		if (fullWidth < viewportWidth) {
			this.x = -(viewportWidth - fullWidth) / 2;
		} else {
			this.x = game.clamp(this.x, 0, fullWidth - viewportWidth);
		}
		if (fullHeight < viewportHeight) {
			this.y = -(viewportHeight - fullHeight) / 2;
		} else {
			this.y = game.clamp(this.y, 0, fullHeight - viewportHeight);
		}
	}

	setZoom(zoom: number) {
		if (game.isPaused()) return; // Prevent zooming while paused
		if (zoom < this.minZoom) zoom = this.minZoom;
		if (zoom > this.maxZoom) zoom = this.maxZoom;
		this.prevZoom = this.zoom;
		this.zoom = zoom;
		console.log(`Zoom set to: ${this.zoom.toFixed(2)}`);
	}

	// Not working yet
	panTo(x: number, y: number) {
		this.targetX = x;
		this.targetY = y;
	}

	setPrevZoom(zoom: number) {
		this.prevZoom = zoom;
	}

	setTracking(target: Creature) {
		this.trackingTarget = target;
	}

	updateTracking(dt: number) {
		if (!this.trackingTarget) return;
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
