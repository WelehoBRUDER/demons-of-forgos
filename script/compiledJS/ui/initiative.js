"use strict";
class InitiativeOrderUI {
    initiativeRow;
    constructor() {
        this.initiativeRow = document.querySelector(".initiative-row");
        combatEvents.on(CombatEventId.TURN_STARTED, this.updateActiveTurn.bind(this));
        combatEvents.on(CombatEventId.CREATURE_DIED, this.removeFromInitiativeOrder.bind(this));
        combatEvents.on(CombatEventId.COMBAT_ENDED, this.hide.bind(this));
    }
    hide() {
        this.initiativeRow.innerHTML = "";
        this.initiativeRow.style.display = "none";
    }
    drawInitiativeOrder() {
        this.initiativeRow.innerHTML = "";
        this.initiativeRow.style.display = "flex"; // Show the initiative row when drawing it
        combatManager.initiativeOrder.forEach((ctx, index) => {
            const creature = entityManager.getCreatureByUID(ctx.uid);
            if (creature) {
                const initiativeEntry = document.createElement("div");
                const portraitImage = new PortraitImage(creature, 64, 64);
                initiativeEntry.classList.add("initiative-entry");
                initiativeEntry.classList.add(Faction[creature.stats.getFaction()].toLowerCase());
                initiativeEntry.classList.add(creature.getUID()); // Add creature UID as a class for easy targeting when removing from initiative order
                if (ctx.uid === combatManager.activeTurnContext?.uid) {
                    initiativeEntry.classList.add("active");
                }
                initiativeEntry.addEventListener("click", (e) => {
                    if (e.button === 1) {
                        // Middle-click to open creature sheet
                        creature.createSheet();
                    }
                });
                initiativeEntry.appendChild(portraitImage.getCanvas());
                this.initiativeRow.appendChild(initiativeEntry);
            }
        });
    }
    updateActiveTurn() {
        const entries = this.initiativeRow.querySelectorAll(".initiative-entry");
        entries.forEach((entry, index) => {
            const ctx = combatManager.initiativeOrder[index];
            if (ctx.uid === combatManager.activeTurnContext?.uid) {
                entry.classList.add("active");
            }
            else {
                entry.classList.remove("active");
            }
        });
    }
    removeFromInitiativeOrder({ creatureUID }) {
        const entries = this.initiativeRow.querySelectorAll(".initiative-entry");
        entries.forEach((entry) => {
            if (entry.classList.contains(creatureUID)) {
                entry.classList.add("hidden");
            }
        });
    }
}
const initiativeOrderUI = new InitiativeOrderUI();
//# sourceMappingURL=initiative.js.map