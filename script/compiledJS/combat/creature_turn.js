"use strict";
class CreatureTurnController {
    owner;
    constructor(owner) {
        this.owner = owner;
    }
    async beginTurn() {
        this.owner.combat.resetActions();
        this.owner.statusEffects.updateEffects(StandardDuration.ROUND); // Update status effects at the beginning of the turn
        return new Promise((resolve) => {
            // Simulate turn processing time (e.g., for animations, effects, etc.)
            setTimeout(() => {
                resolve();
            }, 100); // Adjust the delay as needed
        });
    }
    async endTurn() {
        await this.owner.animationFinished(); // Ensure any movement along a path is completed at the start of the turn
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
                if (this.owner.combat.hasEndedTurn()) {
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