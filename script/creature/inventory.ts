class Inventory {
	private itemInstanceCount: Map<string, number> = new Map(); // Map to track the count of each item instance by its unique ID
	private items: Item[] = [];

	addItem(item: Item) {
		const existingItem = this.getItemById(item.getId());
		if (existingItem && existingItem.stacks()) {
			existingItem.setCount(existingItem.getCount() + item.getCount()); // If the item stacks, increase the count of the existing item
			return;
		}
		this.items.push(item);
		item.setUID(`${item.getId()}:${this.getInstanceCount(item.getId())}`); // Set a unique identifier for this item instance
		this.itemInstanceCount.set(item.getUID(), (this.itemInstanceCount.get(item.getUID()) || 0) + 1);
	}

	getInstanceCount(id: string): number {
		return this.itemInstanceCount.get(id) || 0;
	}

	getItems(): Item[] {
		return this.items;
	}

	getItemById(id: string): Item | undefined {
		return this.items.find((item) => item.getId() === id);
	}

	hasItem(id: string): boolean {
		return this.getItemById(id) !== undefined;
	}
}
