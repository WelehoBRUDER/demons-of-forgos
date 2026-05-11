"use strict";
class Equipment extends Item {
    sizeOnRender;
    anchorPoint;
    constructor(data) {
        super(data);
        this.type = "Equipment";
        this.anchorPoint = data.anchorPoint || AnchorPointType.body; // Default to "body" anchor point if not specified
        this.sizeOnRender = data.sizeOnRender || { width: 116, height: 116 }; // Default to tile size if not specified
    }
    getAnchorPoint() {
        return this.anchorPoint;
    }
    getSizeOnRender() {
        return this.sizeOnRender;
    }
    getModifiers(ctx) {
        return [];
    }
}
//# sourceMappingURL=equipment.js.map