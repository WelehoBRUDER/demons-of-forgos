interface ArmorData extends EquipmentData {
	equippable: EquippableItemData[];
	shield: boolean; // Whether this armor can be equipped in the offhand slot as a shield
	ac: number; // The armor class bonus provided by this armor
	dexLimit: number; // The maximum Dexterity modifier that can be applied to the creature's AC when wearing this armor
}

interface EquippableItemData {
	texturePath?: string;
	sizeOnRender?: { width: number; height: number }; // Size to render the equipment on the canvas, in pixels (default sprite size is 240x240)
	anchorPoint?: AnchorPointType; // The anchor point on the creature's sprite where the equipment should be attached (e.g., "hand", "body", etc.)
	texturePosition?: { x: number; y: number }; // Position of the equipment texture in the item atlas
}

// Armor can actually have multiple anchor points and textures (eg. chest, legs, arms) because of armor sets being how DnD handles armor.
class Armor extends Equipment {
	private equippableItemData: EquippableItemData[];
	shield: boolean; // Whether this armor can be equipped in the offhand slot as a shield
	ac: number; // The armor class bonus provided by this armor
	dexLimit: number; // The maximum Dexterity modifier that can be applied to the creature's AC when wearing this armor

	constructor(data: ArmorData) {
		super(data);
		this.type = "Armor";
		this.equippableItemData = data.equippable || [];
		this.anchorPoint = data.anchorPoint || AnchorPointType.body; // Default to "weapon" anchor point if not specified
		this.shield = data.shield;
		this.ac = data.ac;
		this.dexLimit = data.dexLimit;
	}

	getEquippableItemData() {
		return this.equippableItemData;
	}

	setItemTexturePosition(index: number, x: number, y: number) {
		if (index >= 0 && index < this.equippableItemData.length) {
			this.equippableItemData[index].texturePosition = { x, y };
		} else {
			console.warn(`Invalid equippable item index: ${index}`);
		}
	}

	getDexLimit(): number {
		return this.dexLimit;
	}

	getModifiers(ctx: any): Modifier[] {
		if (this.shield) {
			return [
				{
					id: `${this.id}_shield_modifier`,
					target: "ac",
					operation: Operation.add,
					value: this.ac,
					type: ModifierType.shield,
				},
			];
		} else {
			return [
				{
					id: `${this.id}_armor_modifier`,
					target: "ac",
					operation: Operation.add,
					value: this.ac,
					type: ModifierType.armor,
				},
			];
		}
	}
}
