"use strict";
const defaultEquipment = {
    weapon: null,
    offhand: null,
    armor: null,
    ring1: null,
    ring2: null,
    amulet: null,
    hands: null,
    feet: null,
    head: null,
    cape: null,
};
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
// Masculine and feminine body types. If species doesn't have body type variations, just use "A" for all creatures of that species.
var BodyType;
(function (BodyType) {
    BodyType["A"] = "A";
    BodyType["B"] = "B";
})(BodyType || (BodyType = {}));
var EquipmentSlot;
(function (EquipmentSlot) {
    EquipmentSlot["WEAPON"] = "weapon";
    EquipmentSlot["OFFHAND"] = "offhand";
    EquipmentSlot["ARMOR"] = "armor";
    EquipmentSlot["RING1"] = "ring1";
    EquipmentSlot["RING2"] = "ring2";
    EquipmentSlot["AMULET"] = "amulet";
    EquipmentSlot["HANDS"] = "hands";
    EquipmentSlot["FEET"] = "feet";
    EquipmentSlot["HEAD"] = "head";
    EquipmentSlot["CAPE"] = "cape";
})(EquipmentSlot || (EquipmentSlot = {}));
//# sourceMappingURL=creature_interfaces.js.map