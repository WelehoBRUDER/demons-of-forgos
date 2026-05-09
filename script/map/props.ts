const props: Prop[] = [
	new Prop({ id: "empty", texturePath: "assets/tiles/empty.png" }), // Default prop when no prop is specified, skipped by rendering and pathfinding
	new Prop({ id: "tree_1", texturePath: "assets/props/tree_1.png", isWall: true }),
	new Prop({ id: "tree_2", texturePath: "assets/props/tree_2.png", isWall: true }),
	new Prop({ id: "tree_3", texturePath: "assets/props/tree_3.png", isWall: true }),
];
