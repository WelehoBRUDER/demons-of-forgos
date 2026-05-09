const tiles: Tile[] = [
	new Tile({ id: "empty", texturePath: "assets/tiles/empty.png", isWall: true, isDrop: true, isWater: true }), // Default tile for out-of-bounds areas, treated as a wall
	new Tile({ id: "water", texturePath: "assets/tiles/water.png", isWater: true }),
	new Tile({ id: "grass", texturePath: "assets/tiles/grass.png" }),
	new Tile({ id: "dirt", texturePath: "assets/tiles/dirt.png" }),
	new Tile({ id: "sand", texturePath: "assets/tiles/sand.png" }),
	new Tile({ id: "stone", texturePath: "assets/tiles/stone.png" }),
	new Tile({ id: "stone_wall", texturePath: "assets/tiles/stone_wall.png", isWall: true }),
	new Tile({ id: "gravel", texturePath: "assets/tiles/gravel.png" }),
	new Tile({ id: "shallow_water", texturePath: "assets/tiles/pond_water.png", isDifficultTerrain: true }), // Shallow water that can be walked through but is difficult terrain
	new Tile({ id: "cobble_floor", texturePath: "assets/tiles/cobble_flooring.png" }),
	new Tile({ id: "cracked_stone_floor", texturePath: "assets/tiles/cracked_stone.png" }),
	new Tile({ id: "dungeon_wall", texturePath: "assets/tiles/dungeon_wall.png", isWall: true }),
];
