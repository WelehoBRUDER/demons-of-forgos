class PortraitManager {
	private portraitContainer: HTMLDivElement = document.querySelector(".character-portraits") as HTMLDivElement;

	generateAllPortraits() {
		this.portraitContainer.innerHTML = "";
		const creatures = entityManager.getCreaturesByFaction(Faction.FRIENDLY);
		creatures.forEach((creature) => {
			const portrait = this.generatePortrait(creature);
			this.portraitContainer.appendChild(portrait);
			console.log(`Generated portrait for creature ${creature.getUID()} with template ID ${creature.getTemplateId()}`);
		});
	}

	generatePortrait(creature: Creature): HTMLDivElement {
		const portraitElement: HTMLDivElement = document.createElement("div");
		portraitElement.classList.add("character-portrait");
		portraitElement.innerHTML = `
      <canvas width="128" height="128"></canvas>
      <p>${creature.getTemplateId()}</p>
    `;

		const canvas = portraitElement.querySelector("canvas") as HTMLCanvasElement;
		const ctx = canvas.getContext("2d")!;
		ctx.fillStyle = "#333";
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		mapRenderer.drawCreaturePortrait(creature, ctx);

		return portraitElement;
	}
}

const portraitManager = new PortraitManager();
