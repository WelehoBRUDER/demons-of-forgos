"use strict";
class AddObjectCommand {
    id;
    objectData;
    constructor(objectData) {
        this.id = `addObject_${objectData.x}_${objectData.y}_${objectData.i}`;
        this.objectData = objectData;
    }
    do(state) {
        const obj = getDynamicObjectById(this.objectData.i);
        obj.restoreStrippedData(this.objectData); // Restore the object's state, position, and UID from the stripped data
        state.objects.push(obj);
    }
    undo(state) {
        const index = state.objects.findIndex((obj) => obj.getPosition().x === this.objectData.x && obj.getPosition().y === this.objectData.y && obj.getId() === this.objectData.i);
        if (index !== -1) {
            state.objects.splice(index, 1);
        }
    }
}
//# sourceMappingURL=add_object_command.js.map