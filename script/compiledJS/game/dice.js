"use strict";
var Dice;
(function (Dice) {
    Dice[Dice["d3"] = 3] = "d3";
    Dice[Dice["d4"] = 4] = "d4";
    Dice[Dice["d6"] = 6] = "d6";
    Dice[Dice["d8"] = 8] = "d8";
    Dice[Dice["d10"] = 10] = "d10";
    Dice[Dice["d12"] = 12] = "d12";
    Dice[Dice["d20"] = 20] = "d20";
    Dice[Dice["d100"] = 100] = "d100";
})(Dice || (Dice = {}));
class Die {
    type;
    constructor(type) {
        this.type = type;
    }
    roll() {
        return Math.floor(Math.random() * this.type) + 1;
    }
    rollMultiple(times) {
        const rolls = [];
        for (let i = 0; i < times; i++) {
            rolls.push(this.roll());
        }
        return rolls;
    }
}
class DiceRoller {
    static roll(die, times = 1) {
        const dieInstance = new Die(die);
        return dieInstance.rollMultiple(times);
    }
    static attackRoll(attacker, target, ctx) {
        const d20Roll = this.roll(Dice.d20)[0];
        const attackBonus = ctx.attackBonus;
        const totalRoll = d20Roll + attackBonus;
        const targetAC = target.stats.getAC().full; // Should consider touch and flat-footed but development first, will add later
        const isCriticalThreat = d20Roll >= ctx.weapon.getCritRange();
        let criticalThreatResult = {
            isCriticalThreat: isCriticalThreat,
        };
        if (isCriticalThreat) {
            const confirmationRoll = this.critConfirmationRoll(attacker, target, ctx);
            criticalThreatResult.confirmationRoll = confirmationRoll.confirmationRoll;
            criticalThreatResult.isConfirmed = confirmationRoll.isConfirmed;
            criticalThreatResult.confirmationModifier = confirmationRoll.modifier;
        }
        return {
            attackRoll: d20Roll,
            modifier: attackBonus,
            totalRoll: totalRoll,
            isHit: totalRoll >= targetAC,
            isCritical: criticalThreatResult,
        };
    }
    static critConfirmationRoll(attacker, target, ctx) {
        const d20Roll = this.roll(Dice.d20)[0];
        const attackBonus = ctx.attackBonus;
        const totalRoll = d20Roll + attackBonus;
        const targetAC = target.stats.getAC().full; // Should consider touch and flat-footed but development first, will add later
        return {
            confirmationRoll: totalRoll,
            isConfirmed: totalRoll >= targetAC,
            modifier: attackBonus,
        };
    }
    static rollBetween(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}
//# sourceMappingURL=dice.js.map