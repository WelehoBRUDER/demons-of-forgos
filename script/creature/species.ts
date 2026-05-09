interface SpeciesData {
	id: string;
	type: SpeciesType;
	size: number;
	anchorPoints?: AnchorPoint; // Optional, can be defined per species or use default anchor points in the DynamicCreature class
}

enum SpeciesType {
	humanoid = "humanoid",
	beast = "beast",
	undead = "undead",
}

interface SizeCategories {
	[key: string]: number;
}

interface Stats {
	[str: string]: number;
	dex: number;
	con: number;
	int: number;
	wis: number;
	cha: number;
}

// Defined constants for better readability in code
const TINY = 0.5;
const SMALL = 0.75;
const MEDIUM = 1;
const LARGE = 2;
const HUGE = 3;
const GARGANTUAN = 4; // Maximum size is 4x4 tiles and will never be exceeded by any creature.

const sizeCategories: SizeCategories = {
	tiny: 0.5,
	small: 0.75,
	medium: 1,
	large: 2,
	huge: 3,
	gargantuan: 4, // Maximum size is 4x4 tiles and will never be exceeded by any creature.
};

class Species {
	id: string;
	type: SpeciesType;
	size: number;
	anchorPoints: AnchorPoint = {
		head: { x: 48, y: 12 },
		body: { x: 122, y: 92 },
		legs: { x: 122, y: 157 },
		feet: { x: 122, y: 220 },
		weapon: { x: 36, y: 105 },
	};

	constructor(data: SpeciesData) {
		this.id = data.id;
		this.type = data.type;
		this.size = data.size;
		this.anchorPoints = data.anchorPoints || this.anchorPoints; // Use provided anchor points or default if not specified
	}

	getTexturePath(type: BodyType): string {
		// Implementation for getting texture path based on body type
		return `assets/sprites/player_character/${this.id}/body_${type}.png`;
	}

	getAnchorPoints(): AnchorPoint {
		return this.anchorPoints;
	}
}

const sizeCategoryModifiers: { [key in keyof typeof sizeCategories]: [Modifier] } = {
	tiny: [
		{
			id: "tiny_size_modifier",
			target: "ac",
			operation: Operation.add,
			value: 2,
			type: ModifierType.size,
		},
	],
	small: [
		{
			id: "small_size_modifier",
			target: "ac",
			operation: Operation.add,
			value: 1,
			type: ModifierType.size,
		},
	],
	medium: [
		{
			id: "medium_size_modifier",
			target: "ac",
			operation: Operation.add,
			value: 0,
			type: ModifierType.size,
		},
	],
	large: [
		{
			id: "large_size_modifier",
			target: "ac",
			operation: Operation.add,
			value: -1,
			type: ModifierType.size,
		},
	],
	huge: [
		{
			id: "huge_size_modifier",
			target: "ac",
			operation: Operation.add,
			value: -2,
			type: ModifierType.size,
		},
	],
	gargantuan: [
		{
			id: "gargantuan_size_modifier",
			target: "ac",
			operation: Operation.add,
			value: -4,
			type: ModifierType.size,
		},
	],
};
