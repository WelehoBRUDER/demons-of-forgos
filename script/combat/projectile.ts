class Projectile {
	start: Coordinate;
	position: Coordinate;
	direction: Coordinate;
	impact: Coordinate | null = null;

	constructor(start: Coordinate, direction: Coordinate) {
		this.start = start;
		this.position = { ...start };
		this.direction = direction;
	}
}
