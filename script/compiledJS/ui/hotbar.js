"use strict";
class HotbarManager {
    hotbarElement;
    movementElement;
    actionsElement;
    constructor() {
        this.hotbarElement = document.querySelector(".hotbar");
        combatEvents.on(CombatEventId.TURN_STARTED, () => this.create());
        combatEvents.on(CombatEventId.STAT_CHANGED, () => this.update());
        combatEvents.on(CombatEventId.COMBAT_ENDED, () => this.hide());
    }
    hide() {
        this.hotbarElement.style.display = "none";
    }
    create() {
        this.hotbarElement.innerHTML = "";
        this.hotbarElement.style.display = "flex"; // Show the hotbar when creating it
        const controlledCreature = game.getControlledCreature();
        if (!controlledCreature)
            return;
        if (combatManager.isCreatureTurn(controlledCreature)) {
            this.hotbarElement.classList.remove("locked");
        }
        else {
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
        if (!controlledCreature)
            return;
        const movementText = `Movement: ${controlledCreature.combat.movement} / ${controlledCreature.getMoveSpeed()}`;
        this.movementElement.textContent = movementText;
        const actionsText = `Actions: ${Object.entries(controlledCreature.combat.actions)
            .map(([actionType, count]) => `${actionType}: ${count}`)
            .join(", ")}`;
        this.actionsElement.textContent = actionsText;
    }
}
const hotbarManager = new HotbarManager();
//# sourceMappingURL=hotbar.js.map