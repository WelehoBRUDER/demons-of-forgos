"use strict";
class Inventory {
    itemInstanceCount = new Map(); // Map to track the count of each item instance by its unique ID
    items = [];
    addItem(item) {
        const existingItem = this.getItemById(item.getId());
        if (existingItem && existingItem.stacks()) {
            existingItem.setCount(existingItem.getCount() + item.getCount()); // If the item stacks, increase the count of the existing item
            return;
        }
        this.items.push(item);
        item.setUID(`${item.getId()}:${this.getInstanceCount(item.getId())}`); // Set a unique identifier for this item instance
        this.itemInstanceCount.set(item.getUID(), (this.itemInstanceCount.get(item.getUID()) || 0) + 1);
    }
    getInstanceCount(id) {
        return this.itemInstanceCount.get(id) || 0;
    }
    getItems() {
        return this.items;
    }
    getItemById(id) {
        return this.items.find((item) => item.getId() === id);
    }
    hasItem(id) {
        return this.getItemById(id) !== undefined;
    }
}
//# sourceMappingURL=inventory.js.map