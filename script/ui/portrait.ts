class PortraitManager {
	private portraitContainer: HTMLDivElement = document.querySelector(".character-portraits") as HTMLDivElement;
	private portraits: Map<string, Portrait> = new Map();

	constructor() {
		this.generateAllPortraits();

		combatEvents.on("statChanged", (payload) => {
			this.updatePortrait(payload.creatureUID);
		});
	}

	updatePortrait(creatureUID: string) {
		const portrait = this.portraits.get(creatureUID);
		if (portrait) {
			portrait.updatePortrait();
		} else {
			this.generateAllPortraits(); // If portrait doesn't exist, regenerate all portraits to ensure it's created. This is a fallback and can be optimized later.
		}
	}

	generateAllPortraits() {
		this.portraitContainer.innerHTML = "";
		const creatures = entityManager.getCreaturesByFaction(Faction.PLAYER);
		creatures.forEach((creature) => {
			const portrait = this.generatePortrait(creature);
			this.portraitContainer.append(portrait.getElement());
			portrait.updatePortrait(); // Initial update to render the portrait with the creature's current state
		});
	}

	generatePortrait(creature: Creature): Portrait {
		const portrait = new Portrait(creature.getUID());
		this.portraits.set(creature.getUID(), portrait);
		return portrait;
	}
}

class Portrait {
	private creatureUID: string;
	private element: HTMLDivElement;
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private healthText: HTMLParagraphElement;
	private nameText: HTMLParagraphElement;
	private acText: HTMLParagraphElement;

	constructor(creatureUID: string) {
		this.creatureUID = creatureUID;
		this.element = document.createElement("div");
		this.element.classList.add("character-portrait");
		this.canvas = document.createElement("canvas");
		this.canvas.width = 128;
		this.canvas.height = 128;
		this.ctx = this.canvas.getContext("2d")!;
		const textContainer = document.createElement("div");
		textContainer.classList.add("portrait-text");
		this.healthText = document.createElement("p");
		this.nameText = document.createElement("p");
		this.acText = document.createElement("p");
		this.element.append(this.canvas);
		textContainer.append(this.nameText, this.acText, this.healthText);
		this.element.append(textContainer);
	}

	getElement(): HTMLDivElement {
		return this.element;
	}

	updatePortrait() {
		const creature = entityManager.getCreatureByUID(this.creatureUID);
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		mapRenderer.drawCreaturePortrait(creature, this.ctx);
		this.updateHealth(creature.stats.getHP(), creature.stats.getMaxHP());
		this.nameText.textContent = creature.getTemplateId();
		const { full, flatFooted, touch } = creature.stats.getAC();
		this.acText.textContent = `AC: ${full} (Flat-Footed: ${flatFooted}, Touch: ${touch})`;
	}

	updateHealth(hp: number, maxHp: number) {
		//const creature = entityManager.getCreatureByUID(this.creatureUID);
		//const attackResults = creature?.combat.getAttackResults();
		this.healthText.textContent = `${hp}/${maxHp} HP`;
	}
}

class PortraitImage {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	constructor(creature: Creature, width: number = 64, height: number = 64) {
		this.canvas = document.createElement("canvas");
		this.canvas.width = width;
		this.canvas.height = height;
		this.ctx = this.canvas.getContext("2d")!;
		this.drawPortrait(creature);
	}

	drawPortrait(creature: Creature) {
		mapRenderer.drawCreaturePortrait(creature, this.ctx, this.canvas.width);
	}

	getCanvas(): HTMLCanvasElement {
		return this.canvas;
	}
}

const portraitManager = new PortraitManager();
