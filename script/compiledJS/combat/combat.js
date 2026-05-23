"use strict";
var TurnState;
(function (TurnState) {
    TurnState[TurnState["Idle"] = 0] = "Idle";
    TurnState[TurnState["StartingTurn"] = 1] = "StartingTurn";
    TurnState[TurnState["AwaitingInput"] = 2] = "AwaitingInput";
    TurnState[TurnState["ExecutingAction"] = 3] = "ExecutingAction";
    TurnState[TurnState["ResolvingEffects"] = 4] = "ResolvingEffects";
    TurnState[TurnState["EndingTurn"] = 5] = "EndingTurn";
})(TurnState || (TurnState = {}));
class TurnContext {
    uid;
    state = TurnState.Idle;
    hasEnded = false;
    pendingActions = []; // This can be further typed based on the structure of actions in your game
    constructor(uid) {
        this.uid = uid;
    }
}
class CombatParticipant {
    uid;
    initiative;
    faction;
    isAlive;
    hasActed = false;
    delayed = false; // For actions that delay the participant's turn
    constructor(uid, initiative, faction, isAlive = true) {
        this.uid = uid;
        this.initiative = initiative;
        this.faction = faction;
        this.isAlive = isAlive;
    }
}
class CombatManager {
    initiativeOrder = []; // Array of creature UIDs participating in combat, sorted by initiative order
    round = 0; // Current round of combat, can be used for tracking effects that last a certain number of rounds, etc.
    activeTurnContext = null; // Context for the currently active turn, can be used to track state and pending actions for the current creature's turn
    constructor() {
        combatEvents.on(CombatEventId.CREATURE_DIED, ({ creatureUID }) => this.checkEndCombat(creatureUID));
    }
    startCombat(creatures, ctx) {
        this.round = ctx?.round ?? 1;
        this.activeTurnContext = null;
        creatures.map((creature) => {
            this.addToCombat(creature);
            creature.combat.combatStartUpdate();
        });
        this.activeTurnContext = new TurnContext(this.initiativeOrder[0].uid); // Set active turn context to the first creature in initiative order
        //this.getCurrentTurnCreature().ai.makeDecision(); // Trigger AI decision for the first creature in combat immediately
        initiativeOrderUI.drawInitiativeOrder(); // Draw initiative order UI immediately after starting combat
        this.startTurn(); // Start the first turn immediately after setting up combat
    }
    checkEndCombat(creatureUID) {
        const participant = this.initiativeOrder.find((p) => p.uid === creatureUID);
        if (participant) {
            participant.isAlive = false; // Mark the participant as dead in the initiative order
        }
        const factionsInCombat = this.getFactionsInCombat();
        console.log(factionsInCombat);
        if (factionsInCombat.size <= 1) {
            combatEvents.emit(CombatEventId.COMBAT_ENDED, { winningFaction: factionsInCombat.values().next().value });
            this.initiativeOrder = [];
            this.activeTurnContext = null;
            this.round = 0;
            game.setState(GameState.FREE_ROAM); // Transition back to exploration state after combat ends
        }
    }
    async startTurn() {
        const creature = this.getCurrentTurnCreature();
        if (!creature.stats.isAlive()) {
            this.advanceTurn();
            return;
        }
        const isAI = creature.isAI();
        if (!isAI) {
            game.setControlledCreatureId(creature.getUID()); // Set the current creature as the controlled creature for player input
        }
        combatEvents.emit(CombatEventId.TURN_STARTED, { creatureUID: creature?.getUID(), round: this.round });
        await creature.turn.beginTurn();
        if (isAI) {
            await creature.ai.makeDecision();
        }
        else {
            this.activeTurnContext.state = TurnState.AwaitingInput; // Set turn state to awaiting input for player-controlled creatures
            await creature.turn.awaitPlayerInput(); // Wait for player input to resolve the turn
        }
        await creature.turn.endTurn();
        this.advanceTurn();
    }
    advanceTurn() {
        if (this.initiativeOrder.length === 0) {
            return; // No participants in combat
        }
        const index = this.initiativeOrder.findIndex((p) => p.uid === this.getCurrentTurnCreature()?.getUID());
        this.activeTurnContext = null; // Clear active turn context to reset state for the next turn
        const nextIndex = (index + 1) % this.initiativeOrder.length;
        if (nextIndex === 0) {
            this.round++; // Increment round when we loop back to the first participant
        }
        this.activeTurnContext = new TurnContext(this.initiativeOrder[nextIndex].uid); // Set active turn context for the next creature's turn
        this.startTurn(); // Start the next turn immediately after advancing
    }
    getCurrentTurnCreature() {
        const currentUID = this.activeTurnContext ? this.activeTurnContext.uid : null;
        return entityManager.getCreatureByUID(currentUID);
    }
    addToCombat(creature) {
        if (!this.initiativeOrder.some((p) => p.uid === creature.getUID())) {
            if (!creature.combat.hasRolledInitiative()) {
                creature.combat.rollInitiative();
            }
            const participant = new CombatParticipant(creature.getUID(), creature.combat.getInitiative(), creature.stats.getFaction(), creature.stats.isAlive());
            this.initiativeOrder.push(participant);
            creature.setPath([]); // Clear any existing path to prevent movement during combat
            this.sortParticipantsByInitiative();
        }
    }
    hasParticipant(uid) {
        return this.initiativeOrder.some((p) => p.uid === uid);
    }
    getParticipantsByFaction(faction) {
        return this.initiativeOrder.filter((p) => p.faction === faction);
    }
    getFactionsInCombat() {
        const factions = new Set();
        this.initiativeOrder.forEach((p) => {
            if (p.isAlive) {
                factions.add(p.faction);
            }
        });
        return factions;
    }
    removeFromCombat(creature) {
        const index = this.initiativeOrder.findIndex((p) => p.uid === creature.getUID());
        if (index !== -1) {
            this.initiativeOrder.splice(index, 1);
        }
    }
    sortParticipantsByInitiative() {
        this.initiativeOrder.sort((a, b) => {
            if (a && b) {
                return b.initiative - a.initiative; // Sort descending by initiative
            }
            return 0;
        });
    }
    isCreatureTurn(creature) {
        const currentUID = this.getCurrentTurnCreature()?.getUID();
        return creature.getUID() === currentUID;
    }
}
const combatManager = new CombatManager();
//# sourceMappingURL=combat.js.map