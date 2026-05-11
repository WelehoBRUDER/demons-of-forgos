interface ItemData {
	id: string;
	spritePath?: string; // Optional custom sprite path, defaults to `/assets/items/${id}.png` if not provided
	// Additional properties for items can be added here, such as name, description, stats, etc.
}

enum AnchorPointType {
	head = "head",
	body = "body",
	legs = "legs",
	feet = "feet",
	weapon = "weapon",
}

class Item implements ModifierProvider {
	protected id: string;
	private spritePath: string;
	private spritePosition: { x: number; y: number }; // Position of the item's sprite on the item atlas
	protected type: string; // Class type

	constructor(data: ItemData) {
		this.id = data.id;
		this.spritePath = data.spritePath || `/assets/items/${data.id}.png`;
		this.spritePosition = { x: -1, y: -1 }; // This will be set when the item atlas is generated
		this.type = "Item";
	}

	getId(): string {
		return this.id;
	}

	getTexturePath(): string {
		return this.spritePath;
	}

	setSpritePosition(x: number, y: number) {
		this.spritePosition = { x, y };
	}

	getSpritePosition(): { x: number; y: number } {
		return this.spritePosition;
	}

	getModifiers(ctx: any): Modifier[] {
		return [];
	}
}

class ItemManager {
	items: Map<string, Item>;

	constructor() {
		this.items = new Map<string, Item>();
	}

	addItem(item: Item) {
		this.items.set(item.getId(), item);
	}

	getItem(id: string): Item | undefined {
		return this.items.get(id);
	}

	getAllItems(): Item[] {
		return Array.from(this.items.values());
	}
}

const itemManager = new ItemManager();
