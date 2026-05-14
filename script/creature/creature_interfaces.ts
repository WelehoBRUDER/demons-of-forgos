interface CreatureInterface {
	id: string;
	abilityScores?: AbilityScores;
	x?: number;
	y?: number;
	map?: string;
	faction?: Faction;
	sizeCategory?: SizeCategory;
	uid?: string;
	hp?: number;
	initiative?: number;
	feats?: string[];
	bab?: number;
}

interface StrippedCreatureData {
	i: string;
	u: string;
	x: number;
	y: number;
}

enum AbilityScore {
	STRENGTH = "strength",
	DEXTERITY = "dexterity",
	CONSTITUTION = "constitution",
	INTELLIGENCE = "intelligence",
	WISDOM = "wisdom",
	CHARISMA = "charisma",
}

interface AbilityScores {
	strength: number;
	dexterity: number;
	constitution: number;
	intelligence: number;
	wisdom: number;
	charisma: number;
}

// Movement constants
enum MovementType {
	BLOCKED = 0,
	NORMAL = 1,
}

enum Faction {
	HOSTILE = 0,
	NEUTRAL = 1,
	FRIENDLY = 2,
}

enum HitDice {
	D4 = 4,
	D6 = 6,
	D8 = 8,
	D10 = 10,
	D12 = 12,
	D20 = 20,
}

interface HitDieInfo {
	type: HitDice;
	count: number;
}

interface TilePropertyInteractions {
	isWater: number; // 0 means impeded, 1 means normal
	isLowWall: number; // 0 means impeded, 1 means normal
	isDrop: number; // 0 means impeded, 1 means normal
	isDifficultTerrain: number; // 0 means impeded, 1 means normal
}

const defaultAbilityScores: AbilityScores = {
	strength: 10,
	dexterity: 10,
	constitution: 10,
	intelligence: 10,
	wisdom: 10,
	charisma: 10,
};

interface ArmorClass {
	full: number; // Total AC including all modifiers
	touch: number; // AC against attacks that ignore armor and natural armor
	flatFooted: number; // AC against attacks when the creature is flat-footed (can't use dex bonus)
}

interface AttackContext {
	weapon: Weapon;
	isPrimary: boolean;
	isOffHand: boolean;
	heldInTwoHands: boolean;
	isDualWielding: boolean;
}

interface AttackResult {
	weapon: Weapon;
	attackBonus: number;
	damageMin: number;
	damageMax: number;
	damageType: string;
	criticalThreatRange: number;
	criticalMultiplier: number;
}
