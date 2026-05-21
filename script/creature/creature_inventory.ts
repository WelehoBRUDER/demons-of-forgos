class CreatureInventory {
	owner: Creature; // Reference to the owning creature, used for updating providers when equipment changes
	private itemInstanceCount: Map<string, number> = new Map(); // Map to track the count of each item instance by its unique ID
	items: Item[] = [];
	equipment: ICreatureEquipment;

	constructor(owner: Creature, inventory: I_Inventory) {
		this.owner = owner;
		this.items = inventory?.items ? inventory.items : [];
		this.equipment = inventory?.equipment ? { ...inventory.equipment } : { ...defaultEquipment };
	}

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

	getAllItems(): Item[] {
		return this.getAllEquippedItems()
			.map((eq) => eq.item)
			.concat(this.getItems());
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

	getAllEquippedItems(): { item: Item; slot: EquipmentSlot }[] {
		const items: { item: Item; slot: EquipmentSlot }[] = [];
		for (const slot in this.equipment) {
			const equippedItem = this.equipment[slot as keyof ICreatureEquipment];
			if (equippedItem) {
				items.push({ item: equippedItem, slot: slot as EquipmentSlot });
			}
		}
		return items;
	}

	equipItem(item: Item, slot: EquipmentSlot) {
		this.owner.providersNeedUpdate = true; // Mark providers as needing update since equipment can change modifiers
		if (item instanceof Weapon) {
			this.equipWeapon(item, slot);
		} else {
			this.unequipItem(slot); // Unequip any existing item in the slot before equipping the new one
			this.equipment[slot] = item as any; // Type assertion since equipment can hold different item types
		}
	}

	equipWeapon(weapon: Weapon, slot: EquipmentSlot) {
		const primary = this.getWeaponInSlot(EquipmentSlot.WEAPON);
		const secondary = this.getWeaponInSlot(EquipmentSlot.OFFHAND);

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
		this.owner.providersNeedUpdate = true; // Mark providers as needing update since equipment can change modifiers
		const item = this.getEquippedItem(slot);
		if (item) {
			this.equipment[slot] = null;
			this.addItem(item); // Add the unequipped item back to the inventory
		}
	}

	getWeaponInSlot(slot: EquipmentSlot): Weapon | null {
		const item = this.getEquippedItem(slot);
		if (item instanceof Weapon) {
			return item;
		}
		if (!this.getEquippedItem(EquipmentSlot.WEAPON) && !this.getEquippedItem(EquipmentSlot.OFFHAND)) {
			return itemManager.getItem("unarmed_strike") as Weapon; // Return unarmed strike if no weapons are equipped
		}
		return null;
	}

	getEquippedWeapons(): AttackContext[] {
		const primary = this.getWeaponInSlot(EquipmentSlot.WEAPON);
		const secondary = this.getWeaponInSlot(EquipmentSlot.OFFHAND);

		if (!primary && !secondary) {
			return [
				{
					weapon: itemManager.getItem("unarmed_strike") as Weapon, // Default to unarmed strike if no weapons are equipped
					isPrimary: true,
					isOffHand: false,
					heldInTwoHands: false,
					isDualWielding: true,
				},
				{
					weapon: itemManager.getItem("unarmed_strike") as Weapon, // Off-hand unarmed strike for dual-wielding context
					isPrimary: false,
					isOffHand: true,
					heldInTwoHands: false,
					isDualWielding: true,
				},
			];
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
				offhandIsLight: secondary.isLight(),
			},
			{
				weapon: secondary,
				isPrimary: false,
				isOffHand: true,
				heldInTwoHands: false,
				isDualWielding: true,
				offhandIsLight: secondary.isLight(),
			},
		];
	}
}
