"use strict";
class NPCPlaceCommand {
    id;
    npcData;
    constructor(npcData) {
        this.id = `addNPC_${npcData.x}_${npcData.y}_${npcData.i}`;
        this.npcData = npcData;
    }
    do(state) {
        const npc = entityManager.getEnemyTemplateById(this.npcData.i);
        npc.restoreStrippedData(this.npcData); // Restore the creature's state, position, and UID from the stripped data
        if (!npc.getUID()) {
            npc.setUID(generateUID(editor.getMap().id, npc)); // Generate a new UID if it doesn't exist (for new creatures)
            this.npcData.u = npc.getUID(); // Update the stripped data with the new UID for undo functionality
        }
        state.creatures.push(npc);
    }
    undo(state) {
        const index = state.creatures.findIndex((npc) => npc.getUID() === this.npcData.u);
        if (index !== -1) {
            state.creatures.splice(index, 1);
        }
    }
}
//# sourceMappingURL=npc_place_command.js.map