"use strict";
var AbilityScore;
(function (AbilityScore) {
    AbilityScore["STRENGTH"] = "strength";
    AbilityScore["DEXTERITY"] = "dexterity";
    AbilityScore["CONSTITUTION"] = "constitution";
    AbilityScore["INTELLIGENCE"] = "intelligence";
    AbilityScore["WISDOM"] = "wisdom";
    AbilityScore["CHARISMA"] = "charisma";
})(AbilityScore || (AbilityScore = {}));
// Movement constants
var MovementType;
(function (MovementType) {
    MovementType[MovementType["BLOCKED"] = 0] = "BLOCKED";
    MovementType[MovementType["NORMAL"] = 1] = "NORMAL";
})(MovementType || (MovementType = {}));
var Faction;
(function (Faction) {
    Faction[Faction["HOSTILE"] = 0] = "HOSTILE";
    Faction[Faction["NEUTRAL"] = 1] = "NEUTRAL";
    Faction[Faction["FRIENDLY"] = 2] = "FRIENDLY";
})(Faction || (Faction = {}));
var HitDice;
(function (HitDice) {
    HitDice[HitDice["D4"] = 4] = "D4";
    HitDice[HitDice["D6"] = 6] = "D6";
    HitDice[HitDice["D8"] = 8] = "D8";
    HitDice[HitDice["D10"] = 10] = "D10";
    HitDice[HitDice["D12"] = 12] = "D12";
    HitDice[HitDice["D20"] = 20] = "D20";
})(HitDice || (HitDice = {}));
const defaultAbilityScores = {
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
};
//# sourceMappingURL=creature_interfaces.js.map