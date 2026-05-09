interface DynamicCreatureInterface extends CreatureInterface {
	species: string; // will store Species class data
	bodyType: BodyType; // will store body type data
	hair?: number; // optional, for future use when we add hair style variations
	eyes?: number; // optional, for future use when we add eye style variations
	mouth?: number; // optional, for future use when we add mouth style variations
	equipment?: EquipmentInterface; // optional, for future use when we add equipment like weapons, armor, etc.
	uid: string; // Unique identifier for the dynamic creature, used for referencing in the map and editor
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
}

interface DynamicSpriteTextures {
	body: string;
	hair: string;
	eyes: string;
	mouth: string;
	ears: string;
	items: Item[];
}

interface EquipmentInterface {
	weapon?: Weapon;
	armor?: Armor;
}

// All PCs use this class because their rendering starts from a base body sprite with hair, items etc layered on top.
class DynamicCreature extends Creature {
	private static nextId = 1; // Static property to keep track of the next available ID
	species: string;
	bodyType: BodyType;
	hair: number;
	eyes: number;
	mouth: number;
	equipment: EquipmentInterface;

	constructor(data: DynamicCreatureInterface) {
		super(data);
		this._id = DynamicCreature.nextId++; // Assign the current value of nextId to _id, then increment nextId
		this.species = data.species;
		this.bodyType = data.bodyType || BodyType.A; // Default to body type "A" if not specified
		this.hair = data.hair || 1;
		this.eyes = data.eyes || 1;
		this.mouth = data.mouth || 1;
		this.baseClass = "DynamicCreature";
		this.equipment = data.equipment || {};
		this.uid = data.uid; // Set the UID from the data, which should be unique for each dynamic creature
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
			items: this.getAllEquippedItems(),
		};
	}

	getAllEquippedItems(): Item[] {
		const items: Item[] = [];
		if (this.equipment.weapon) {
			items.push(this.equipment.weapon);
		}
		if (this.equipment.armor) {
			items.push(this.equipment.armor);
		}
		return items;
	}

	equipItem(item: Item) {
		if (item instanceof Weapon) {
			this.equipment.weapon = item;
		}
		if (item instanceof Armor) {
			this.equipment.armor = item;
		}
		this.renderSprite(); // Re-render the sprite to reflect the equipped item
	}

	// Dynamic creatures must be tracked separately due to unique rendering.
	getIndex(): number {
		return this._id;
	}

	getSizeCategoryId(): string {
		return speciesManager.getSpeciesById(this.species)?.size.toString() || "medium";
	}

	getSizeCategory(): number {
		return speciesManager.getSpeciesById(this.species)?.size || sizeCategories.medium;
	}

	renderSprite(): void {
		atlas.drawDynamicSprite(this);
	}
}
