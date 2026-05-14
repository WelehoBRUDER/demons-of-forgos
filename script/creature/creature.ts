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
	bab: number = 0; // Base Attack Bonus, can be calculated based on class levels for player characters or set as a static value for enemies

	initiative: number = 0; // Initiative score for turn order in combat, can be set based on stats or randomly
	statusEffects: string[] = []; // List of status effect identifiers currently affecting the creature, such as "poisoned", "stunned", etc.
	feats: string[] = []; // List of feat identifiers that grant special abilities or modifiers to the creature
	equipment: EquipmentInterface = {}; // Object to hold equipped items, which can provide modifiers and affect the creature's stats and abilities
	inventory = new Inventory(); // Inventory to hold items the creature is carrying, separate from equipped items

	hp: number = 4;

	constructor(data: CreatureInterface) {
		this._id = creatureIndex++; // Assign a unique ID to each creature
		this.id = data.id;
		this.x = data.x ?? -1;
		this.y = data.y ?? -1;
		this.map = data.map ?? "";
		this.abilityScores = data.abilityScores ? { ...data.abilityScores } : { ...defaultAbilityScores };
		this.faction = data.faction ?? Faction.NEUTRAL;
		this.sizeCategory = data.sizeCategory ?? SizeCategory.MEDIUM;
		this.screenX = this.x;
		this.screenY = this.y;
		this.lastMoved = Math.random();
		this.uid = data.uid ?? null; // UID will be set when the creature is added to the map
		this.initiative = data.initiative ?? 0; // 0 outside combat
		this.feats = data.feats ?? [];
		this.bab = data.bab ?? 0;

		this.setHP(data.hp ?? this.getMaxHP()); // Set HP to provided value or max HP if not provided
	}

	getInventory(): Inventory {
		return this.inventory;
	}

	getAllItems(): Item[] {
		return this.getAllEquippedItems().concat(this.inventory.getItems());
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

	resetHP() {
		this.setHP(this.getMaxHP());
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

	getInitiative(): number {
		return this.initiative;
	}

	getInitiativeBonus(): number {
		let base: number = this.getAbilityScoreModifiers().dexterity;
		const bonuses: number = modifierManager.getTotalModifier("initiative", this, {}) as number;
		return base + bonuses;
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

	getBaseAttackBonus(): number {
		return this.bab; // This should be calculated based on class levels for player characters or set as a static value for enemies
	}

	getHitDiceTotalCount(): number {
		const hitDice = this.getHitDice();
		let total = 0;
		for (const hd of hitDice) {
			total += hd.count; // Average roll of the hit die
		}

		return total;
	}

	getAllProviders(): ModifierProvider[] {
		if (!this.providersNeedUpdate) {
			return this.providers;
		}

		const updatedProviders: ModifierProvider[] = [];

		updatedProviders.push(...this.getAllEquippedItems());
		updatedProviders.push(this.getSizeProvider());
		updatedProviders.push(...this.getFeatProviders());
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

	equipItem(item: Item, slot: EquipmentSlot) {
		this.providersNeedUpdate = true; // Mark providers as needing update since equipment can change modifiers
		if (item instanceof Weapon) {
			this.equipWeapon(item, slot);
		}
	}

	equipWeapon(weapon: Weapon, slot: EquipmentSlot) {
		const primary = this.getPrimaryWeapon();
		const secondary = this.getSecondaryWeapon();

		if (weapon.getWeaponType() === WeaponType.RANGED || weapon.isHeavy()) {
			if (primary) {
				this.unequipItem(EquipmentSlot.WEAPON);
			}
			if (secondary) {
				this.unequipItem(EquipmentSlot.OFFHAND);
			}
			this.equipment.weapon = weapon;
			return;
		}

		if (slot === EquipmentSlot.WEAPON) {
			if (primary) {
				this.unequipItem(EquipmentSlot.WEAPON);
			}
			this.equipment.weapon = weapon;
		} else if (slot === EquipmentSlot.OFFHAND) {
			if (secondary) {
				this.unequipItem(EquipmentSlot.OFFHAND);
			}
			this.equipment.offhand = weapon;
		}
	}

	getEquippedItem(slot: EquipmentSlot): Item | null {
		return this.equipment[slot] || null;
	}

	unequipItem(slot: EquipmentSlot) {
		this.providersNeedUpdate = true; // Mark providers as needing update since equipment can change modifiers
		const item = this.getEquippedItem(slot);
		if (item) {
			this.equipment[slot] = null;
		}
		this.getInventory().addItem(item); // Add the unequipped item back to the inventory
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

		if (!hitDice) return 1;

		Object.values(hitDice).forEach((hitDieInfo) => {
			base += hitDieInfo.count * (hitDieInfo.type / 2 + 1); // Average roll of the hit die, e.g. D6 averages to 3.5, so (6/2)+1 = 4
			base += hitDieInfo.count * (hitDieBonus + constitutionBonus); // Add any per-hit-die bonuses
		});

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

	setHP(amount: number) {
		this.hp = amount;
		this.hp = Math.min(this.hp, this.getMaxHP()); // Ensure HP does not exceed max HP
	}

	getPrimaryWeapon(): Weapon | null {
		if (this.equipment.weapon) {
			return this.equipment.weapon;
		}
		return null;
	}

	getSecondaryWeapon(): Weapon | null {
		if (this.equipment.offhand && this.equipment.offhand instanceof Weapon) {
			return this.equipment.offhand;
		}
		return null;
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

	getEquippedWeapons(): AttackContext[] {
		const primary = this.getPrimaryWeapon();
		const secondary = this.getSecondaryWeapon();

		if (!primary && !secondary) {
			return [];
		}

		if (primary && !secondary) {
			return [
				{
					weapon: primary,
					isPrimary: true,
					isOffHand: false,
					heldInTwoHands: false,
					isDualWielding: false,
				},
			];
		}

		return [
			{
				weapon: primary,
				isPrimary: true,
				isOffHand: false,
				heldInTwoHands: false,
				isDualWielding: true,
			},
			{
				weapon: secondary,
				isPrimary: false,
				isOffHand: true,
				heldInTwoHands: false,
				isDualWielding: true,
			},
		];
	}

	buildAttack(ctx: AttackContext): AttackResult {
		const weapon = ctx.weapon;

		const damageDice = this.handleDamageDieProgression(weapon.getDamage());

		const attackBonus = this.getWeaponAttackBonus(ctx);

		const [damageMin, damageMax] = this.calculateBaseDamage(damageDice, ctx);

		const critRange = weapon.getCritRange();
		const critMultiplier = weapon.getCritMultiplier();

		return {
			weapon,
			attackBonus,
			damageMin,
			damageMax,
			damageType: weapon.getDamageType(),
			criticalThreatRange: critRange,
			criticalMultiplier: critMultiplier,
		};
	}

	getAttackResults(): AttackResult[] {
		return this.getEquippedWeapons().map((ctx) => this.buildAttack(ctx));
	}

	formatAttackResult(attackResult: AttackResult): string {
		if (!attackResult) return "";
		const criticalThreatRangeText = attackResult.criticalThreatRange < 20 ? `${attackResult.criticalThreatRange}-20` : "20";
		return `${attackResult.weapon.getId()} +${attackResult.attackBonus} to hit, Damage: ${attackResult.damageMin}-${attackResult.damageMax} ${attackResult.damageType}, Crit: ${criticalThreatRangeText} x${attackResult.criticalMultiplier}`;
	}

	getWeaponAttackBonus(ctx: AttackContext): number {
		const weapon = ctx.weapon;
		const weaponType = weapon.getWeaponType();
		const attackType = weaponType === WeaponType.MELEE ? "meleeAtk" : "rangedAtk";
		const baseAttackBonus = this.getBaseAttackBonus();
		const abilityModifier = weapon.isFinesse()
			? Math.max(this.getAbilityScoreModifiers().strength, this.getAbilityScoreModifiers().dexterity)
			: this.getAbilityScoreModifiers().strength;
		const modBonuses: number = modifierManager.getTotalModifier(attackType, this, { weapon }) as number;
		return baseAttackBonus + abilityModifier + modBonuses;
	}

	calculateBaseDamage(dice: DamageDieInfo, ctx: AttackContext): number[] {
		const minDamage = dice.count; // Minimum damage is the number of dice (e.g. 2d6 has a minimum of 2)
		const maxDamage = dice.count * dice.type; // Maximum damage is the number of dice times the type (e.g. 2d6 has a maximum of 12)
		let bonusDamage = 0; // This will be calculated from ability modifiers, feats, equipment, etc.
		const attackType = ctx.weapon.getWeaponType() === WeaponType.MELEE ? "meleeDmg" : "rangedDmg";
		const modBonuses: number = modifierManager.getTotalModifier(attackType, this, ctx) as number;
		bonusDamage += modBonuses;
		bonusDamage += this.getStrengthBasedDamageBonus(ctx); // Calculate strength-based damage bonus based on attack context
		const totalMinDamage = minDamage + bonusDamage;
		const totalMaxDamage = maxDamage + bonusDamage;
		return [totalMinDamage, totalMaxDamage]; // Return min and max damage for simplicity, can be changed to a random roll if desired
	}

	getStrengthBasedDamageBonus(ctx: AttackContext): number {
		const str: number = this.getAbilityScoreModifiers().strength;

		if (ctx.weapon.getWeaponType() === WeaponType.RANGED) {
			return ctx.weapon.isComposite() ? str : 0; // Composite bows add strength bonus to damage, regular ranged weapons do not
		}

		if (ctx.isOffHand) {
			return Math.floor(str / 2); // Off-hand attacks typically get half the strength bonus
		}

		if (ctx.heldInTwoHands) {
			return Math.floor(str * 1.5); // Two-handed attacks typically get 1.5 times the strength bonus
		}

		return str; // Normal strength bonus for one-handed attacks
	}

	handleDamageDieProgression(damage: DamageDieInfo): DamageDieInfo {
		// Default behavior
		const sizeCategory = this.getSizeCategory();
		if (sizeCategory < SizeCategory.MEDIUM) {
			// Weapon damage dice are reduced
			damage = DamageProgression.getPreviousDamage(damage);
		} else if (sizeCategory > SizeCategory.MEDIUM) {
			// Weapon damage dice are increased
			damage = DamageProgression.getNextDamage(damage, 2 * (sizeCategory - SizeCategory.MEDIUM)); // Increase damage by 2 steps for each size category above medium
		}
		return damage;
	}
}

const creatures: Creature[] = [];
