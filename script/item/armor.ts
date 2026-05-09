interface ArmorData extends EquipmentData {
	equippable: EquippableItemData[];
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

	constructor(data: ArmorData) {
		super(data);
		this.type = "Armor";
		this.equippableItemData = data.equippable || [];
		this.anchorPoint = data.anchorPoint || AnchorPointType.body; // Default to "weapon" anchor point if not specified
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
}
