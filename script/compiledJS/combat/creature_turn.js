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
    async endTurn() { }
}
//# sourceMappingURL=creature_turn.js.map