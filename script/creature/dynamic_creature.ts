// All PCs use this class because their rendering starts from a base body sprite with hair, items etc layered on top.
class DynamicCreature extends Creature implements IDynamicCreature {
	private static nextId = 1; // Static property to keep track of the next available ID
	species: string;
	bodyType: BodyType;
	hair: number;
	eyes: number;
	mouth: number;
	classes: CreatureClasses;
	name: string = "Player Character";

	constructor(data: IDynamicCreature) {
		super(data);
		this._id = DynamicCreature.nextId++; // Assign the current value of nextId to _id, then increment nextId
		this.species = data.species;
		this.bodyType = data.bodyType || BodyType.A; // Default to body type "A" if not specified
		this.hair = data.hair || 1;
		this.eyes = data.eyes || 1;
		this.mouth = data.mouth || 1;
		this.baseClass = "DynamicCreature";
		this.name = data.name || this.name; // Use provided name or default to "Player Character"
		this.uid = data.uid; // Set the UID from the data, which should be unique for each dynamic creature
		this.stats = new DynamicCreatureStats(this, data.stats);
		this.inventory = new DynamicCreatureInventory(this, data.inventory || { items: [], equipment: {} });
		this.classes = new CreatureClasses(this, data.classes);
		this.combat = new DynamicCreatureCombat(this, data.combat);
		this.renderSprite();
	}

	// Dynamic creatures are rendered on their own atlas with separate textures for each customization option.
	// Their sprites on the atlas are redrawn only when something about their appearance changes, such as equipping a new item.
	getTexturesToRender(): DynamicSpriteTextures {
		const species = speciesManager.getSpeciesById(this.species);
		if (!species) {
			throw new Error(`Species not found for ID: ${this.species}`);
		}

		return {
			body: species.getTexturePath(this.bodyType),
			ears: `assets/sprites/player_character/${this.species}/ears.png`,
			hair: `assets/sprites/player_character/hair/hair_${this.hair}.png`,
			eyes: `assets/sprites/player_character/eyes/eyes_${this.eyes}.png`,
			mouth: `assets/sprites/player_character/mouth/nose_mouth_${this.mouth}.png`,
			items: this.inventory.getAllEquippedItems(),
		};
	}

	getName(): string {
		return this.name;
	}

	getHitDice(): HitDieInfo[] {
		return this.classes ? this.classes.getHitDice() : [];
	}

	// Dynamic creatures must be tracked separately due to unique rendering.
	getIndex(): number {
		return this._id;
	}

	getSizeCategoryId(): string {
		return speciesManager.getSpeciesById(this.species)?.size.toString() || "medium";
	}

	renderSprite(): void {
		atlas.drawDynamicSprite(this);
	}
}

class DynamicCreatureStats extends CreatureStats {
	declare owner: DynamicCreature;

	constructor(owner: DynamicCreature, stats?: ICreatureStats) {
		super(owner, stats);
		this.owner = owner;
	}

	getMaxHP(): number {
		let base: number = super.getMaxHP();
		const hitDieDifference: number = this.owner?.classes?.getPrimaryClassHitDieDifference();
		// Slightly janky maybe, but this lines makes it so that dynamic creatures benefit from their full hit die at 1st level.
		return Math.floor(base + hitDieDifference);
	}

	getSaves(): Saves {
		const saves: Saves = super.getSaves();
		const classSaves = this.owner.classes ? this.owner.classes.getTotalSaves() : { [Save.FORTITUDE]: 0, [Save.REFLEX]: 0, [Save.WILL]: 0 };
		return {
			[Save.FORTITUDE]: saves[Save.FORTITUDE] + classSaves[Save.FORTITUDE],
			[Save.REFLEX]: saves[Save.REFLEX] + classSaves[Save.REFLEX],
			[Save.WILL]: saves[Save.WILL] + classSaves[Save.WILL],
		};
	}

	getSizeCategory(): number {
		return speciesManager.getSpeciesById(this.owner.species)?.size || SizeCategory.MEDIUM;
	}
}

class DynamicCreatureCombat extends CreatureCombat {
	declare owner: DynamicCreature;

	constructor(owner: DynamicCreature, combat?: ICreatureCombat) {
		super(owner, combat);
		this.owner = owner;
	}

	getBaseAttackBonus(): number {
		return this.owner.classes.getBaseAttackBonus();
	}
}

class DynamicCreatureInventory extends CreatureInventory {
	declare owner: DynamicCreature;

	constructor(owner: DynamicCreature, inventory: I_Inventory) {
		super(owner, inventory);
		this.owner = owner;
	}
	equipItem(item: Item, slot: EquipmentSlot): void {
		super.equipItem(item, slot);
		this.owner.renderSprite(); // Re-render the creature's sprite whenever an item is equipped to reflect the change visually
	}
}
