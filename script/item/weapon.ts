interface WeaponData extends EquipmentData {}

class Weapon extends Equipment {
	constructor(data: WeaponData) {
		super(data);
		this.type = "Weapon";
		this.anchorPoint = data.anchorPoint || AnchorPointType.weapon; // Default to "weapon" anchor point if not specified
	}
}
