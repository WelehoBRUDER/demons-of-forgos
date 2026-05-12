"use strict";
var SizeCategory;
(function (SizeCategory) {
    SizeCategory[SizeCategory["TINY"] = 0.5] = "TINY";
    SizeCategory[SizeCategory["SMALL"] = 0.75] = "SMALL";
    SizeCategory[SizeCategory["MEDIUM"] = 1] = "MEDIUM";
    SizeCategory[SizeCategory["LARGE"] = 2] = "LARGE";
    SizeCategory[SizeCategory["HUGE"] = 3] = "HUGE";
    SizeCategory[SizeCategory["GARGANTUAN"] = 4] = "GARGANTUAN";
})(SizeCategory || (SizeCategory = {}));
const sizeCategoryModifiers = {
    TINY: [
        {
            id: "tiny_size_modifier",
            target: "ac",
            operation: Operation.add,
            value: 2,
            type: ModifierType.size,
        },
    ],
    SMALL: [
        {
            id: "small_size_modifier",
            target: "ac",
            operation: Operation.add,
            value: 1,
            type: ModifierType.size,
        },
    ],
    MEDIUM: [
        {
            id: "medium_size_modifier",
            target: "ac",
            operation: Operation.add,
            value: 0,
            type: ModifierType.size,
        },
    ],
    LARGE: [
        {
            id: "large_size_modifier",
            target: "ac",
            operation: Operation.add,
            value: -1,
            type: ModifierType.size,
        },
    ],
    HUGE: [
        {
            id: "huge_size_modifier",
            target: "ac",
            operation: Operation.add,
            value: -2,
            type: ModifierType.size,
        },
    ],
    GARGANTUAN: [
        {
            id: "gargantuan_size_modifier",
            target: "ac",
            operation: Operation.add,
            value: -4,
            type: ModifierType.size,
        },
    ],
};
class Size {
    static getSizeMultiplier(sizeCategory) {
        return sizeCategory;
    }
    static getProvider(sizeCategory) {
        return new SizeProvider(sizeCategory);
    }
}
class SizeProvider {
    size;
    constructor(size) {
        this.size = size;
    }
    getModifiers() {
        const key = SizeCategory[this.size];
        return sizeCategoryModifiers[key];
    }
}
//# sourceMappingURL=size.js.map