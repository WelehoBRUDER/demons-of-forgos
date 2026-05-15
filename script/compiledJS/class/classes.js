"use strict";
class ClassManager {
    classes = new Map();
    addClass(creatureClass) {
        this.classes.set(creatureClass.id, new CreatureClass(creatureClass));
    }
    getClass(id) {
        return this.classes.get(id);
    }
}
const classManager = new ClassManager();
classManager.addClass({
    id: "fighter",
    bab: BAB.HIGH,
    hitDie: HitDice.D10,
    saves: { [Save.FORTITUDE]: SaveProgression.GOOD, [Save.REFLEX]: SaveProgression.POOR, [Save.WILL]: SaveProgression.POOR },
});
//# sourceMappingURL=classes.js.map