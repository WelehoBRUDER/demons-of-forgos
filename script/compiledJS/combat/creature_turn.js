"use strict";
class CreatureTurnController {
    owner;
    constructor(owner) {
        this.owner = owner;
    }
    async beginTurn() {
        this.owner.combat.resetActions();
        return new Promise((resolve) => {
            // Simulate turn processing time (e.g., for animations, effects, etc.)
            setTimeout(() => {
                resolve();
            }, 100); // Adjust the delay as needed
        });
    }
    async endTurn() {
        return new Promise((resolve) => {
            // Simulate end-of-turn processing time (e.g., for animations, effects, etc.)
            setTimeout(() => {
                resolve();
            }, 100); // Adjust the delay as needed
        });
    }
    awaitPlayerInput() {
        return new Promise((resolve) => {
            const checkForInput = () => {
                if (this.owner.combat.hasPerformedAction()) {
                    resolve();
                }
                else {
                    requestAnimationFrame(checkForInput);
                }
            };
            checkForInput();
        });
    }
}
//# sourceMappingURL=creature_turn.js.map