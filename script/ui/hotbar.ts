class HotbarManager {
	hotbarElement: HTMLDivElement;
	movementElement: HTMLDivElement;
	actionsElement: HTMLDivElement;

	constructor() {
		this.hotbarElement = document.querySelector(".hotbar") as HTMLDivElement;

		combatEvents.on("turnStarted", () => this.create());
		combatEvents.on("statChanged", () => this.update());
	}

	create() {
		this.hotbarElement.innerHTML = "";
		const controlledCreature = game.getControlledCreature();
		if (!controlledCreature) return;

		if (combatManager.isCreatureTurn(controlledCreature)) {
			this.hotbarElement.classList.remove("locked");
		} else {
			this.hotbarElement.classList.add("locked");
		}

		const movementText = `Movement: ${controlledCreature.combat.movement} / ${controlledCreature.getMoveSpeed()}`;
		const movementElement = document.createElement("div");
		movementElement.classList.add("hotbar-item");
		movementElement.textContent = movementText;
		this.movementElement = movementElement;
		this.hotbarElement.appendChild(movementElement);

		const actionsText = `Actions: ${Object.entries(controlledCreature.combat.actions)
			.map(([actionType, count]) => `${actionType}: ${count}`)
			.join(", ")}`;
		const actionsElement = document.createElement("div");
		actionsElement.classList.add("hotbar-item");
		actionsElement.textContent = actionsText;
		this.actionsElement = actionsElement;
		this.hotbarElement.appendChild(actionsElement);
	}

	update() {
		const controlledCreature = game.getControlledCreature();
		if (!controlledCreature) return;

		const movementText = `Movement: ${controlledCreature.combat.movement} / ${controlledCreature.getMoveSpeed()}`;
		this.movementElement.textContent = movementText;

		const actionsText = `Actions: ${Object.entries(controlledCreature.combat.actions)
			.map(([actionType, count]) => `${actionType}: ${count}`)
			.join(", ")}`;
		this.actionsElement.textContent = actionsText;
	}
}

const hotbarManager = new HotbarManager();
