"use strict";
class CreatureClass {
    id;
    bab;
    hitDie;
    saves;
    constructor(data) {
        this.id = data.id;
        this.bab = data.bab;
        this.hitDie = data.hitDie;
        this.saves = data.saves;
    }
    getHitDie() {
        return {
            type: this.hitDie,
            count: 1,
        };
    }
    getBABAtLevel(level) {
        return Math.floor(level * this.bab);
    }
    getSavesAtLevel(level) {
        const saves = {
            [Save.FORTITUDE]: Math.floor(level * this.saves[Save.FORTITUDE]),
            [Save.REFLEX]: Math.floor(level * this.saves[Save.REFLEX]),
            [Save.WILL]: Math.floor(level * this.saves[Save.WILL]),
        };
        for (const save in this.saves) {
            if (this.saves[save] === SaveProgression.GOOD) {
                saves[save] += 2; // Good saves get an additional +2 at level 1
            }
        }
        return saves;
    }
}
//# sourceMappingURL=creature_class.js.map