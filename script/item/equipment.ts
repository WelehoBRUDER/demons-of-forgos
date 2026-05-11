interface EquipmentData extends ItemData {
	sizeOnRender?: { width: number; height: number }; // Size to render the equipment on the canvas, in pixels (default sprite size is 240x240)
	anchorPoint?: AnchorPointType; // The anchor point on the creature's sprite where the equipment should be attached (e.g., "hand", "body", etc.)
}

class Equipment extends Item {
	sizeOnRender: { width: number; height: number };
	anchorPoint: AnchorPointType;

	constructor(data: EquipmentData) {
		super(data);
		this.type = "Equipment";
		this.anchorPoint = data.anchorPoint || AnchorPointType.body; // Default to "body" anchor point if not specified
		this.sizeOnRender = data.sizeOnRender || { width: 116, height: 116 }; // Default to tile size if not specified
	}

	getAnchorPoint(): AnchorPointType {
		return this.anchorPoint;
	}

	getSizeOnRender(): { width: number; height: number } {
		return this.sizeOnRender;
	}

	getModifiers(ctx: any): Modifier[] {
		return [];
	}
}
