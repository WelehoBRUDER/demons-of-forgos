interface CreatureInterface {
	id: string;
	x?: number;
	y?: number;
	map?: string;
	faction?: Faction;
	sizeCategory?: SizeCategory;
	uid?: string;
	hp?: number;
	initiative?: number;
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

let creatureIndex = 0;
class Creature implements CreatureInterface {
	_id: number;
	id: string;
	uid: string;
	x: number;
	y: number;
	abilityScores: AbilityScores = defaultAbilityScores;
	screenX: number = 0; // For smooth movement, this will be updated gradually towards x
	screenY: number = 0; // For smooth movement, this will be updated gradually towards y
	baseClass: string = "Creature";
	lastMoved: number = 0;
	map: string; // ID pointing to the map the creature is on, set when added to map
	faction: Faction = Faction.NEUTRAL; // 0 = hostile, 1 = neutral, 2 = friendly. This can be used for AI behavior and targeting.
	sizeCategory: SizeCategory = SizeCategory.MEDIUM;
	currentPath: { x: number; y: number }[] = [];
	visualOffsetX: number = 0; // For smooth movement, this will be updated gradually towards 0
	visualOffsetY: number = 0; // For smooth movement, this will be updated gradually towards 0
	providers: ModifierProvider[] = []; // This can hold references to various sources of modifiers, such as equipped items, active effects, etc.
	providersNeedUpdate: boolean = false; // Flag to indicate if providers need to be re-evaluated, for example after taking damage or equipping an item

	initiative: number = 0; // Initiative score for turn order in combat, can be set based on stats or randomly
	statusEffects: string[] = []; // List of status effect identifiers currently affecting the creature, such as "poisoned", "stunned", etc.
	feats: string[] = []; // List of feat identifiers that grant special abilities or modifiers to the creature
	equipment: EquipmentInterface = {}; // Object to hold equipped items, which can provide modifiers and affect the creature's stats and abilities

	hp: number = 4;

	constructor(data: CreatureInterface) {
		this._id = creatureIndex++; // Assign a unique ID to each creature
		this.id = data.id;
		this.x = data.x ?? -1;
		this.y = data.y ?? -1;
		this.map = data.map ?? "";
		this.faction = data.faction ?? Faction.NEUTRAL;
		this.sizeCategory = data.sizeCategory ?? SizeCategory.MEDIUM;
		this.screenX = this.x;
		this.screenY = this.y;
		this.lastMoved = Math.random();
		this.hp = data.hp ?? this.getMaxHP();
		this.uid = data.uid ?? null; // UID will be set when the creature is added to the map
		this.initiative = data.initiative ?? 0; // 0 outside combat
	}

	restoreStrippedData(data: StrippedCreatureData) {
		this.setUID(data.u);
		this.setPosition(data.x, data.y);
	}

	getUID(): string {
		return this.uid;
	}

	setUID(uid: string) {
		this.uid = uid;
	}

	setId(id: number) {
		this._id = id;
	}

	isPlayerControlled(): boolean {
		return game.getControlledCreatureId() === this.uid;
	}

	getTemplateId(): string {
		return this.id;
	}

	setMap(mapId: string) {
		this.map = mapId;
	}

	setFaction(faction: Faction) {
		this.faction = faction;
	}

	getIndex(): number {
		return this._id;
	}

	getBaseClass(): string {
		return this.baseClass;
	}

	getMap(): string {
		return this.map;
	}

	getFaction(): Faction {
		return this.faction;
	}

	getHitDice(): HitDieInfo[] {
		// This should be implemented based on the creature's class or species
		// Typically, enemies return a static count while player characters calculate it based on their class levels and hit dice progression
		return [{ type: HitDice.D6, count: 1 }]; // Default to 1 D6 for now
	}

	getAllProviders(): ModifierProvider[] {
		if (!this.providersNeedUpdate) {
			return this.providers;
		}

		const updatedProviders: ModifierProvider[] = [];

		updatedProviders.push(...this.getAllEquippedItems());
		updatedProviders.push(this.getSizeProvider());
		// TODO - Add active effects, status effects, feats, racial traits, class features, etc. as providers

		this.providers = updatedProviders;
		this.providersNeedUpdate = false;

		return updatedProviders;
	}

	getAC(): ArmorClass {
		let ac = 10;
		let touchAC = 10;
		let flatFootedAC = 10;
		const dexBonus = this.getAbilityScoreModifiers().dexterity;

		ac += Math.min(dexBonus, this.dexToACLimit());
		touchAC += Math.min(dexBonus, this.dexToACLimit());

		const acBonuses = modifierManager.getTotalModifier("ac", this, null, { groupedByType: true }) as GroupedModifiers;
		for (const modType in acBonuses) {
			const value = acBonuses[modType as ModifierType] || 0;
			if (modType === ModifierType.armor || modType === ModifierType.shield || modType === ModifierType.naturalArmor) {
				ac += value;
				flatFootedAC += value;
			} else {
				ac += value;
				touchAC += value;
				flatFootedAC += value;
			}
		}
		// Future: Add armor, shields, natural armor, magical effects, etc.
		return {
			full: ac,
			touch: touchAC,
			flatFooted: flatFootedAC,
		};
	}

	getAllEquippedItems(): Item[] {
		const items: Item[] = [];
		if (this.equipment.weapon) {
			items.push(this.equipment.weapon);
		}
		if (this.equipment.offhand) {
			items.push(this.equipment.offhand);
		}
		if (this.equipment.armor) {
			items.push(this.equipment.armor);
		}
		return items;
	}

	equipItem(item: Item) {
		this.providersNeedUpdate = true; // Mark providers as needing update since equipment can change modifiers
		if (item instanceof Weapon) {
			this.equipment.weapon = item;
		}
		if (item instanceof Armor) {
			this.equipment.armor = item;
		}
	}

	setPosition(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.screenX = x * atlas.getTileSize();
		this.screenY = y * atlas.getTileSize();
	}

	setX(x: number) {
		this.x = x;
		this.screenX = x * atlas.getTileSize();
	}

	setY(y: number) {
		this.y = y;
		this.screenY = y * atlas.getTileSize();
	}

	dexToACLimit(): number {
		const items: Item[] = this.getAllEquippedItems();
		let maxDexLimit = -Infinity;
		for (const item of items) {
			if (item instanceof Armor) {
				const dexLimit = item.getDexLimit();
				if (dexLimit > maxDexLimit) {
					maxDexLimit = dexLimit;
				}
			}
		}
		return maxDexLimit !== -Infinity ? maxDexLimit : Infinity; // 0 = no benefit, 2 = max +2 AC from dex, etc.
	}

	// This function should only be called for testing.
	// For actual gameplay, use a random wandering behavior or player-controlled movement instead.
	moveRandomly() {
		if (this.isPlayerControlled()) return;
		const directions = [
			{ dx: 0, dy: -1 }, // Up
			{ dx: 0, dy: 1 }, // Down
			{ dx: -1, dy: 0 }, // Left
			{ dx: 1, dy: 0 }, // Right
			{ dx: -1, dy: -1 }, // Up-Left
			{ dx: 1, dy: -1 }, // Up-Right
			{ dx: -1, dy: 1 }, // Down-Left
			{ dx: 1, dy: 1 }, // Down-Right
			{ dx: 0, dy: 0 }, // Stay in place
		];
		const randomDirection = directions[Math.floor(Math.random() * directions.length)];
		const newX = this.x + randomDirection.dx;
		const newY = this.y + randomDirection.dy;
		// Check bounds and tile properties before moving
		const cost = pathfinder.costToEnter(newX, newY, mapRenderer.getMap(), this, this.getSizeCategory());
		//console.log(`Creature ${this.id} attempting to move to (${newX}, ${newY}) with movement cost:`, cost);
		if (cost !== Infinity) {
			this.move(newX, newY);
		}
	}

	getSizeCategoryId(): string {
		return SizeCategory[this.sizeCategory];
	}

	getSizeCategory(): number {
		return this.sizeCategory;
	}

	getSizeProvider(): ModifierProvider {
		return Size.getProvider(this.sizeCategory);
	}

	getOccupiedArea(): number[][] {
		const box: number[][] = [];
		const size = this.getSizeCategory();

		// Tiny creatures don't occupy a full tile
		if (size < 0.75) {
			return box;
		}

		// Small and medium creatures occupy the tile they are directly standing on (by x and y coordinates)
		if (size <= 1) {
			return [[this.x, this.y]];
		}

		// Large and huge creatures occupy multiple tiles in a square area based on their size category

		// Size is always symmetrical, ie 1x1, 2x2, 3x3 etc.
		for (let dx = 0; dx < size; dx++) {
			for (let dy = 0; dy < size; dy++) {
				box.push([this.x + dx, this.y + dy]);
			}
		}

		return box;
	}

	setScreenPosition(x: number, y: number) {
		this.screenX = x;
		this.screenY = y;
	}

	getScreenPosition(): { x: number; y: number } {
		return { x: this.screenX, y: this.screenY };
	}

	getCenterScreenPosition(): { x: number; y: number } {
		const offset = (this.getSizeCategory() * atlas.getTileSize()) / 2;
		return { x: this.screenX + offset, y: this.screenY + offset };
	}

	getPosition(): { x: number; y: number } {
		return { x: this.x, y: this.y };
	}

	move(newX: number, newY: number) {
		this.x = newX;
		this.y = newY;
		//mapRenderer.renderVisibleMap(camera); // Re-render the map to reflect the creature's new position
	}

	getHP(): number {
		return this.hp;
	}

	takeDamage(amount: number) {
		this.hp -= amount;
		if (this.hp <= 0) {
			//this.die();
		}
	}

	setHP(amount: number) {
		this.hp = amount;
	}

	calcAbilityModifierFromScore(score: number): number {
		return Math.floor((score - 10) / 2);
	}

	getAbilityScores(): AbilityScores {
		const scores: AbilityScores = { ...this.abilityScores };
		for (const ability in scores) {
			const bonuses: number = modifierManager.getTotalModifier(ability, this, {}) as number;
			scores[ability as keyof AbilityScores] += bonuses;
		}
		return scores;
	}

	getAbilityScoreModifiers(): AbilityScores {
		const scores = this.getAbilityScores();
		return {
			strength: this.calcAbilityModifierFromScore(scores.strength),
			dexterity: this.calcAbilityModifierFromScore(scores.dexterity),
			constitution: this.calcAbilityModifierFromScore(scores.constitution),
			intelligence: this.calcAbilityModifierFromScore(scores.intelligence),
			wisdom: this.calcAbilityModifierFromScore(scores.wisdom),
			charisma: this.calcAbilityModifierFromScore(scores.charisma),
		};
	}

	getMaxHP(): number {
		let base: number = 0;
		const flatBonus: number = modifierManager.getTotalModifier("hp", this, {}) as number;
		const hitDieBonus: number = modifierManager.getTotalModifier("hp.per_hitDie", this, {}) as number;
		const constitutionBonus: number = this.getAbilityScoreModifiers().constitution;
		const hitDice = this.getHitDice();

		for (const hitDieInfo of hitDice) {
			base += hitDieInfo.count * (hitDieInfo.type / 2 + 1); // Average roll of the hit die, e.g. D6 averages to 3.5, so (6/2)+1 = 4
			base += hitDieInfo.count * (hitDieBonus + constitutionBonus); // Add any per-hit-die bonuses
		}

		Math.floor(base);

		return base + flatBonus;
	}

	getHpPercentage(): number {
		return Math.max(0, this.hp / this.getMaxHP());
	}

	getMoveSpeed(): number {
		return 6; // Default movement is 6 tiles per action.
	}

	getFlySpeed(): number {
		return 0; // Flight must be specified by creature stat block.
	}

	getHoverSpeed(): number {
		return 0; // Hovering must be specified by creature stat block.
	}

	// isWall will always block movement, as it is explicitly an enclosed barrier.
	getTilePropertyInteractions(): TilePropertyInteractions {
		// 0 means impeded, 1 means normal
		// The return value could also be a weight for pathfinding depending on the speed
		return {
			isWater: this.getFlySpeed() === 0 ? MovementType.BLOCKED : MovementType.NORMAL,
			isLowWall: this.getHoverSpeed() === 0 ? MovementType.BLOCKED : MovementType.NORMAL,
			isDrop: this.getFlySpeed() === 0 ? MovementType.BLOCKED : MovementType.NORMAL,
			isDifficultTerrain: MovementType.BLOCKED, // This can be explicitly changed for creatures that are unaffected by difficult terrain.
		};
	}

	rollInitiative(): number {
		const roll = DiceRoller.roll(Dice.d20)[0];
		const initiative = roll + this.getAbilityScoreModifiers().dexterity;
		this.initiative = initiative;
		return initiative;
	}

	moveOnPath(dt: number) {
		this.handleMovementAnimation(dt);
		if (this.currentPath.length === 0 || !this.hasFinishedMoving()) return;
		const nextTile = this.currentPath.shift();
		if (nextTile) {
			const cost = pathfinder.costToEnter(nextTile.x, nextTile.y, mapRenderer.getMap(), this, this.getSizeCategory());
			/* Something is blocking the path */
			if (cost === Infinity) {
				const goal = mapRenderer.getPathPredictionGoal();
				this.currentPath = []; // Clear the path if the next tile is no longer passable
				if (goal) {
					game.requestPath({ x: this.x, y: this.y }, [goal], this);
				}
				return;
			}
			this.move(nextTile.x, nextTile.y);
		}
	}

	setVisualOffset(x: number, y: number) {
		this.visualOffsetX = x;
		this.visualOffsetY = y;
	}

	getVisualOffset(): { x: number; y: number } {
		return { x: this.visualOffsetX, y: this.visualOffsetY };
	}

	handleMovementAnimation(dt: number) {
		const progress = this.movementProgressToNextTile();
		const { x, y } = this.getVisualOffset();
		const walkBob: number = 10; // How many pixels the creature bobs
		const offsetY = Math.sin(progress * Math.PI) * walkBob; // Bob up and down in a sine wave pattern for a smooth walking animation
		this.setVisualOffset(x, offsetY);
	}

	movementProgressToNextTile(): number {
		const targetScreenX = this.x * atlas.getTileSize();
		const targetScreenY = this.y * atlas.getTileSize();
		const dx = targetScreenX - this.screenX;
		const dy = targetScreenY - this.screenY;
		const distanceToNextTile = Math.sqrt(dx * dx + dy * dy);
		const totalDistance = atlas.getTileSize();
		return 1 - distanceToNextTile / totalDistance; // Returns a value between 0 and 1 indicating progress towards the next tile
	}

	hasFinishedMoving(): boolean {
		return this.movementProgressToNextTile() >= 1; // Consider movement finished when the creature has reached or passed the target tile
	}

	setPath(path: { x: number; y: number }[]) {
		this.currentPath = path;
	}

	getPath(): { x: number; y: number }[] {
		return this.currentPath;
	}

	getStrippedData(): StrippedCreatureData {
		return {
			i: this.id,
			u: this.uid,
			x: this.x,
			y: this.y,
		};
	}
}

const creatures: Creature[] = [];
