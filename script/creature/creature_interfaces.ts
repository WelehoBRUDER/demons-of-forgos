interface ICreature {
	id: string;
	x?: number;
	y?: number;
	map?: string;
	uid?: string;
	initiative?: number;
	feats?: string[];
	bab?: number;
	stats?: ICreatureStats;
	inventory?: CreatureInventory;
	combat?: ICreatureCombat;
	ai?: CreatureAI;
	turn?: CreatureTurnController;
}

interface ICreatureStats {
	abilityScores?: AbilityScores;
	faction?: Faction;
	sizeCategory?: SizeCategory;
	hp?: number;
	saves?: Saves;
}

interface ICreatureCombat {
	bab?: number;
	initiative?: number;
	actions?: Actions;

	getAttackResults(): AttackResult[];
	buildAttack(ctx: AttackContext): AttackResult;
	calculateBaseDamage(dice: DamageDieInfo, ctx: AttackContext): number[];
	handleDamageDieProgression(damage: DamageDieInfo): DamageDieInfo;
	getStrengthBasedDamageBonus(ctx: AttackContext): number;
}

enum Action {
	STANDARD = "standard",
	MOVE = "move",
	FULL_ROUND = "fullRound",
	SWIFT = "swift",
}

interface Actions {
	[Action.STANDARD]?: number; // Number of standard actions available (usually 1)
	[Action.MOVE]?: number; // Number of move actions available (usually 1)
	[Action.FULL_ROUND]?: number; // Number of full-round actions available (can be more than 1)
	[Action.SWIFT]?: number; // Number of swift actions available (usually 1)
}

interface IDynamicCreature extends ICreature {
	species: string; // will store Species class data
	bodyType: BodyType; // will store body type data
	hair?: number; // optional, for future use when we add hair style variations
	eyes?: number; // optional, for future use when we add eye style variations
	mouth?: number; // optional, for future use when we add mouth style variations
	uid: string; // Unique identifier for the dynamic creature, used for referencing in the map and editor
	classes?: CreatureClasses; // Optional class and level information for the creature, which can affect stats and combat
}

interface INPCCreature extends ICreature {
	species: string;
	spritePath: string;
	spritePosition?: { x: number; y: number };
	baseHitDice: HitDieInfo[]; // Optional hit dice information for the NPC, can be used to calculate HP and other stats
	equipment?: ICreatureEquipment; // Optional starting equipment for the NPC
	modifiers?: Modifier[]; // Optional array of modifiers specific to this NPC, such as racial traits, class features, etc.
}

interface StrippedCreatureData {
	i: string;
	u: string;
	x: number;
	y: number;
}

interface I_Inventory {
	items: Item[];
	equipment: ICreatureEquipment;
}

const defaultEquipment: ICreatureEquipment = {
	weapon: null,
	offhand: null,
	armor: null,
	ring1: null,
	ring2: null,
	amulet: null,
	hands: null,
	feet: null,
	head: null,
	cape: null,
};

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
	PLAYER = 3,
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
	offhandIsLight?: boolean;
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

// Masculine and feminine body types. If species doesn't have body type variations, just use "A" for all creatures of that species.
enum BodyType {
	A = "A",
	B = "B",
}

interface AnchorPoint {
	head: { x: number; y: number };
	body: { x: number; y: number };
	legs: { x: number; y: number };
	feet: { x: number; y: number };
	weapon: { x: number; y: number };
	offhand: { x: number; y: number };
}

interface DynamicSpriteTextures {
	body: string;
	hair: string;
	eyes: string;
	mouth: string;
	ears: string;
	items: { item: Item; slot: EquipmentSlot }[];
}

enum EquipmentSlot {
	WEAPON = "weapon",
	OFFHAND = "offhand",
	ARMOR = "armor",
	RING1 = "ring1",
	RING2 = "ring2",
	AMULET = "amulet",
	HANDS = "hands",
	FEET = "feet",
	HEAD = "head",
	CAPE = "cape",
}

interface ICreatureEquipment {
	weapon?: Weapon | null;
	offhand?: Weapon | Armor | null;
	armor?: Armor | null;
	ring1?: Item | null;
	ring2?: Item | null;
	amulet?: Item | null;
	hands?: Item | null;
	feet?: Item | null;
	head?: Item | null;
	cape?: Item | null;
}

enum AttackIteration {
	PRIMARY = "primary",
	OFFHAND = "offhand", // By default, offhand attacks can at most 1 iteration
	PRIMARY_FULL = "primary_full", // Extra primary attack at full BAB
}

interface CreatureFullAttackCount {
	[AttackIteration.PRIMARY]: number;
	[AttackIteration.OFFHAND]: number;
	[AttackIteration.PRIMARY_FULL]: number;
}

enum BAB {
	LOW = 1 / 2,
	MEDIUM = 3 / 4,
	HIGH = 1,
}

interface ICreatureClass {
	id: string;
	bab: BAB;
	hitDie: HitDice;
	saves: { [key in Save]: SaveProgression };
}

interface ICreatureClasses {
	classes: ICreatureClassLevel[];
}

interface ICreatureClassLevel {
	class: CreatureClass;
	level: number;
	isPrimary: boolean; // Whether or not this was the first class taken
}

enum Save {
	FORTITUDE = "fortitude",
	REFLEX = "reflex",
	WILL = "will",
}

interface Saves {
	[Save.FORTITUDE]: number;
	[Save.REFLEX]: number;
	[Save.WILL]: number;
}

enum SaveProgression {
	POOR = 1 / 3,
	GOOD = 1 / 2,
}
