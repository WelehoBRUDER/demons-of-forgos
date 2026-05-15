class ClassManager {
	classes: Map<string, CreatureClass> = new Map();

	addClass(creatureClass: ICreatureClass) {
		this.classes.set(creatureClass.id, new CreatureClass(creatureClass));
	}

	getClass(id: string): CreatureClass | undefined {
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
