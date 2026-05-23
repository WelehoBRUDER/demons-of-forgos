class CreatureSheet implements WindowContent {
	element: HTMLDivElement;
	creatureUID: string;

	constructor(creatureUID: string) {
		this.creatureUID = creatureUID;
		this.element = document.createElement("div");
		this.element.classList.add("creature-sheet");
		this.update();

		combatEvents.on(CombatEventId.STAT_CHANGED, this.update.bind(this));
	}

	getElement(): HTMLDivElement {
		return this.element;
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
		const mods = creature.stats.getAbilityScoreModifiers();
		const saves = creature.stats.getSaves();
		const ac = creature.stats.getAC();
		const attacks = creature.combat.getAttackResults();
		const initiativeBonus = creature.combat.getInitiativeBonus();
		const statusEffects = creature.statusEffects.getActiveEffects();
		const feats = creature.getFeats();
		let attacksText = "";
		attacks.forEach((attack, index) => {
			const formattedAttack = creature.combat.formatAttackResult(attack);
			attacksText += `${formattedAttack}<br>`;
		});
		let featsText = "";
		for (const featInstance of feats) {
			const featId = featInstance.feat;
			const params = featInstance.params;
			featsText += `${featId}`;
			if (params) {
				if (params.weapon) {
					featsText += `: ${params.weapon}`;
				}
			}
			featsText += `<br>`;
		}
		this.element.innerHTML = `
      <h2>${creature.getName()}</h2>
      <p>HP: ${creature.stats.getHP()}/${creature.stats.getMaxHP()}</p>
      <p>AC: ${ac.full} / Flat-footed: ${ac.flatFooted} / Touch: ${ac.touch}</p>
			<p>Initiative: ${initiativeBonus >= 0 ? "+" : ""}${initiativeBonus}</p>
			<h3>Attributes</h3>
      <div class="attributes">
        <p>STR: ${attributes.strength} (${mods.strength >= 0 ? "+" : ""}${mods.strength})</p>
        <p>DEX: ${attributes.dexterity} (${mods.dexterity >= 0 ? "+" : ""}${mods.dexterity})</p>
        <p>CON: ${attributes.constitution} (${mods.constitution >= 0 ? "+" : ""}${mods.constitution})</p>
        <p>INT: ${attributes.intelligence} (${mods.intelligence >= 0 ? "+" : ""}${mods.intelligence})</p>
        <p>WIS: ${attributes.wisdom} (${mods.wisdom >= 0 ? "+" : ""}${mods.wisdom})</p>
        <p>CHA: ${attributes.charisma} (${mods.charisma >= 0 ? "+" : ""}${mods.charisma})</p>
      </div>
			<h3>Saves</h3>
      <div class="saves">
        <p>Fortitude: ${saves.fortitude}</p>
        <p>Reflex: ${saves.reflex}</p>
        <p>Will: ${saves.will}</p>
      </div>
      <p>Feats: ${featsText}</p>
			<p>BAB: ${creature.combat.getBaseAttackBonus()}</p>
      <p>Attacks:</p>
      <p>${attacksText}</p>
			<p>Status Effects: ${statusEffects.map((effect) => effect.id).join(", ")}</p>
    `;
	}
}
