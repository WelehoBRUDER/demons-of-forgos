"use strict";
var Operation;
(function (Operation) {
    Operation[Operation["add"] = 0] = "add";
    Operation[Operation["multiply"] = 1] = "multiply";
    Operation[Operation["override"] = 2] = "override";
})(Operation || (Operation = {}));
var ModifierType;
(function (ModifierType) {
    ModifierType[ModifierType["alchemical"] = 0] = "alchemical";
    ModifierType[ModifierType["armor"] = 1] = "armor";
    ModifierType[ModifierType["circumstance"] = 2] = "circumstance";
    ModifierType[ModifierType["competence"] = 3] = "competence";
    ModifierType[ModifierType["deflection"] = 4] = "deflection";
    ModifierType[ModifierType["enhancement"] = 5] = "enhancement";
    ModifierType[ModifierType["inherent"] = 6] = "inherent";
    ModifierType[ModifierType["insight"] = 7] = "insight";
    ModifierType[ModifierType["luck"] = 8] = "luck";
    ModifierType[ModifierType["morale"] = 9] = "morale";
    ModifierType[ModifierType["naturalArmor"] = 10] = "naturalArmor";
    ModifierType[ModifierType["profane"] = 11] = "profane";
    ModifierType[ModifierType["resistance"] = 12] = "resistance";
    ModifierType[ModifierType["sacred"] = 13] = "sacred";
    ModifierType[ModifierType["shield"] = 14] = "shield";
    ModifierType[ModifierType["size"] = 15] = "size";
    ModifierType[ModifierType["untyped"] = 16] = "untyped";
})(ModifierType || (ModifierType = {}));
//# sourceMappingURL=modifier.js.map