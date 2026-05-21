class CreatureSheet {
	element: HTMLDivElement;
	creatureUID: string;

	constructor(creatureUID: string) {
		this.creatureUID = creatureUID;
		this.element = document.createElement("div");
		this.element.classList.add("creature-sheet");
		drag.add(this.element, [], () => this.update());
		document.body.appendChild(this.element);
		this.update();
	}

	getCreature(): Creature | undefined {
		return entityManager.getCreatureByUID(this.creatureUID);
	}

	update() {
		const creature = this.getCreature();
		if (!creature) {
			this.element.innerHTML = "<p>Creature not found.</p>";
			return;
		}
		const attributes = creature.stats.getAbilityScores();
		const saves = creature.stats.getSaves();
		this.element.innerHTML = `
      <h2>${creature.getName()}</h2>
      <p>HP: ${creature.stats.getHP()}/${creature.stats.getMaxHP()}</p>
      <p>AC: ${creature.stats.getAC()}</p>
      <div class="attributes">
        <p>STR: ${attributes.strength}</p>
        <p>DEX: ${attributes.dexterity}</p>
        <p>CON: ${attributes.constitution}</p>
        <p>INT: ${attributes.intelligence}</p>
        <p>WIS: ${attributes.wisdom}</p>
        <p>CHA: ${attributes.charisma}</p>
      </div>
      <div class="saves">
        <p>Fortitude: ${saves.fortitude}</p>
        <p>Reflex: ${saves.reflex}</p>
        <p>Will: ${saves.will}</p>
      </div>
      <p>Feats: ${creature.getFeats().join(", ")}</p>
      <p>Status Effects: ${creature.statusEffects.join(", ")}</p>
      
    `;
	}
}
