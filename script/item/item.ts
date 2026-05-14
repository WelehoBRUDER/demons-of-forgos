interface ItemData {
	id: string;
	spritePath?: string; // Optional custom sprite path, defaults to `/assets/items/${id}.png` if not provided
	count?: number; // For stackable items, this represents the quantity of the item in the stack (default is 1)
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
	private uid: string; // Unique identifier for this specific item instance, used for inventory management and equipping
	private spritePath: string;
	private spritePosition: { x: number; y: number }; // Position of the item's sprite on the item atlas
	private count: number = 1; // For stackable items, this represents the quantity of the item in the stack
	protected type: string; // Class type

	constructor(data: ItemData) {
		this.id = data.id;
		this.spritePath = data.spritePath || `/assets/items/${data.id}.png`;
		this.spritePosition = { x: -1, y: -1 }; // This will be set when the item atlas is generated
		this.count = data.count || 1; // Default to 1 if not provided
		this.type = "Item";
	}

	getId(): string {
		return this.id;
	}

	setUID(uid: string) {
		this.uid = uid;
	}

	getUID(): string {
		return this.uid;
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

	setCount(count: number) {
		this.count = count;
	}

	getCount(): number {
		return this.count;
	}

	stacks(): boolean {
		return true;
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
