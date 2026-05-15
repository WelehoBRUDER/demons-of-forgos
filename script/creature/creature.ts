const creatureDefaultModifiers: ModifierProvider = {
	getModifiers(creature: Creature, ctx: any): Modifier[] {
		return [
			{
				id: "base_fort_save",
				target: Save.FORTITUDE,
				operation: Operation.add,
				evaluate: () => creature.stats.getAbilityScoreModifiers().constitution,
				type: ModifierType.untyped,
			},
			{
				id: "base_ref_save",
				target: Save.REFLEX,
				operation: Operation.add,
				evaluate: () => creature.stats.getAbilityScoreModifiers().dexterity,
				type: ModifierType.untyped,
			},
			{
				id: "base_will_save",
				target: Save.WILL,
				operation: Operation.add,
				evaluate: () => creature.stats.getAbilityScoreModifiers().wisdom,
				type: ModifierType.untyped,
			},
		];
	},
};

let creatureIndex = 0;
class Creature implements ICreature {
	_id: number;
	id: string;
	uid: string;
	x: number;
	y: number;
	stats: CreatureStats;
	screenX: number = 0; // For smooth movement, this will be updated gradually towards x
	screenY: number = 0; // For smooth movement, this will be updated gradually towards y
	baseClass: string = "Creature";
	lastMoved: number = 0;
	map: string; // ID pointing to the map the creature is on, set when added to map
	currentPath: { x: number; y: number }[] = [];
	visualOffsetX: number = 0; // For smooth movement, this will be updated gradually towards 0
	visualOffsetY: number = 0; // For smooth movement, this will be updated gradually towards 0
	providers: ModifierProvider[] = []; // This can hold references to various sources of modifiers, such as equipped items, active effects, etc.
	providersNeedUpdate: boolean = false; // Flag to indicate if providers need to be re-evaluated, for example after taking damage or equipping an item
	bab: number = 0; // Base Attack Bonus, can be calculated based on class levels for player characters or set as a static value for enemies

	initiative: number = -Infinity; // Initiative score for turn order in combat, can be set based on stats or randomly
	statusEffects: string[] = []; // List of status effect identifiers currently affecting the creature, such as "poisoned", "stunned", etc.
	feats: string[] = []; // List of feat identifiers that grant special abilities or modifiers to the creature
	inventory: CreatureInventory; // Inventory to hold items the creature is carrying, separate from equipped items
	combat: CreatureCombat; // Combat-related data and methods for the creature

	constructor(data: ICreature) {
		this._id = creatureIndex++; // Assign a unique ID to each creature
		this.id = data.id;
		this.x = data.x ?? -1;
		this.y = data.y ?? -1;
		this.map = data.map ?? "";
		this.stats = new CreatureStats(this, data.stats || { hp: 4 });
		this.inventory = new CreatureInventory(this, data.inventory); // Initialize an empty inventory, can be populated with data.inventory if provided
		this.combat = new CreatureCombat(this, data.combat); // Initialize combat data, can be populated with data.combat if provided
		this.screenX = this.x;
		this.screenY = this.y;
		this.lastMoved = Math.random();
		this.uid = data.uid ?? null; // UID will be set when the creature is added to the map
		this.initiative = data.initiative ?? -Infinity; // -Infinity outside combat
		this.feats = data.feats ?? [];
		this.bab = data.bab ?? 0;

		//this.setHP(data.hp ?? this.getMaxHP()); // Set HP to provided value or max HP if not provided
	}

	isInCombat(): boolean {
		return combatManager.hasParticipant(this.uid);
	}

	getInventory(): CreatureInventory {
		return this.inventory;
	}

	restoreStrippedData(data: StrippedCreatureData) {
		this.setUID(data.u);
		this.setPosition(data.x, data.y);
	}

	addFeat(featId: string) {
		this.feats.push(featId);
		this.providersNeedUpdate = true; // Mark providers as needing update since feats can change modifiers
	}

	getFeats(): string[] {
		return this.feats;
	}

	getFeatProviders(): ModifierProvider[] {
		const providers: ModifierProvider[] = [];
		for (const featId of this.feats) {
			const feat = featManager.getFeat(featId);
			if (feat) {
				providers.push(feat);
			}
		}
		return providers;
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

	getIndex(): number {
		return this._id;
	}

	getBaseClass(): string {
		return this.baseClass;
	}

	getMap(): string {
		return this.map;
	}

	getAllProviders(): ModifierProvider[] {
		if (!this.providersNeedUpdate) {
			return this.providers;
		}

		const updatedProviders: ModifierProvider[] = [];

		updatedProviders.push(creatureDefaultModifiers);
		updatedProviders.push(...this.inventory.getAllEquippedItems());
		updatedProviders.push(this.stats.getSizeProvider());
		updatedProviders.push(...this.getFeatProviders());
		// TODO - Add active effects, status effects, feats, racial traits, class features, etc. as providers

		this.providers = updatedProviders;
		this.providersNeedUpdate = false;

		return updatedProviders;
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
		const items: Item[] = this.inventory.getAllEquippedItems();
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
		const cost = pathfinder.costToEnter(newX, newY, mapRenderer.getMap(), this, this.stats.getSizeCategory());
		//console.log(`Creature ${this.id} attempting to move to (${newX}, ${newY}) with movement cost:`, cost);
		if (cost !== Infinity) {
			this.move(newX, newY);
		}
	}

	getOccupiedArea(): number[][] {
		const box: number[][] = [];
		const size = this.stats.getSizeCategory();

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
		const offset = (this.stats.getSizeCategory() * atlas.getTileSize()) / 2;
		return { x: this.screenX + offset, y: this.screenY + offset };
	}

	getPosition(): { x: number; y: number } {
		return { x: this.x, y: this.y };
	}

	move(newX: number, newY: number) {
		this.x = newX;
		this.y = newY;
		this.combatStartCheck();
		//mapRenderer.renderVisibleMap(camera); // Re-render the map to reflect the creature's new position
	}

	takeDamage(amount: number) {
		this.stats.setHP(this.stats.getHP() - amount);
		if (this.stats.getHP() <= 0) {
			//this.die();
		}
	}

	getHitDice(): HitDieInfo[] {
		return [{ type: HitDice.D6, count: 1 }]; // Default to 1 D6 for now, should be overridden by specific creature types
	}

	getHitDiceTotalCount(): number {
		const hitDice = this.getHitDice();
		let total = 0;
		for (const hd of hitDice) {
			total += hd.count; // Average roll of the hit die
		}

		return total;
	}

	getMoveSpeed(): number {
		const bonusSpeed = modifierManager.getTotalModifier("movementSpeed", this, {}) as number;
		return 6 + bonusSpeed; // Default movement is 6 tiles per action.
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

	combatStartCheck() {
		if (game.getState() === GameState.COMBAT) return; // Don't trigger combat if we're already in combat

		const playerCharacters: Creature[] = entityManager.getCreaturesByFaction(Faction.PLAYER, { map: this.map });
		const hostileCreatures: Creature[] = entityManager.getCreaturesByFaction(Faction.HOSTILE, { map: this.map });

		console.log(playerCharacters, hostileCreatures);
		for (const pc of playerCharacters) {
			for (const creature of hostileCreatures) {
				const dist = pathfinder.heuristic({ x: creature.x, y: creature.y }, { x: pc.x, y: pc.y });
				if (dist <= this.getAggroRange()) {
					game.setState(GameState.COMBAT);
					combatManager.startCombat(playerCharacters.concat(hostileCreatures));
					return;
				}
			}
		}
	}

	moveOnPath(dt: number) {
		this.handleMovementAnimation(dt);
		if (this.currentPath.length === 0 || !this.hasFinishedMoving()) return;
		const nextTile = this.currentPath.shift();
		if (nextTile) {
			const cost = pathfinder.costToEnter(nextTile.x, nextTile.y, mapRenderer.getMap(), this, this.stats.getSizeCategory());
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

	getAggroRange(): number {
		return 5; // Default aggro range of 5 tiles, can be overridden by specific creature types
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
