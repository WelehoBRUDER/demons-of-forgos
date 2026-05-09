"use strict";
class Weapon extends Equipment {
    constructor(data) {
        super(data);
        this.type = "Weapon";
        this.anchorPoint = data.anchorPoint || AnchorPointType.weapon; // Default to "weapon" anchor point if not specified
    }
}
//# sourceMappingURL=weapon.js.map