enum Operation {
	add,
	multiply,
	override,
}

enum ModifierType {
	alchemical,
	armor,
	circumstance,
	competence,
	deflection,
	enhancement,
	inherent,
	insight,
	luck,
	morale,
	naturalArmor,
	profane,
	resistance,
	sacred,
	shield,
	size,
	untyped,
}

type Modifier = {
	id: string;
	target: string;
	operation: Operation;
	value: number;
	type: ModifierType;
	sourceType?: string;
	sourceId?: string;
	enabled?: boolean;
	tags?: string[]; // Optional tags for additional categorization or filtering
};
