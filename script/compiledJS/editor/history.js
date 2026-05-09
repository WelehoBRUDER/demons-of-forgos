"use strict";
class EditorHistory {
    history = [];
    redoHistory = [];
    execute(command, state) {
        command.do(state);
        this.history.push(command);
        this.redoHistory = [];
        mapRenderer.renderVisibleMap(camera); // Re-render the map to reflect the new state after executing the command
    }
    undo(state) {
        const command = this.history.pop();
        if (!command)
            return;
        command.undo(state);
        this.redoHistory.push(command);
        mapRenderer.renderVisibleMap(camera); // Re-render the map to reflect the undo action
    }
    redo(state) {
        const command = this.redoHistory.pop();
        if (!command)
            return;
        command.do(state);
        this.history.push(command);
        mapRenderer.renderVisibleMap(camera); // Re-render the map to reflect the redo action
    }
    clear() {
        this.history = [];
        this.redoHistory = [];
    }
}
const editorHistory = new EditorHistory();
//# sourceMappingURL=history.js.map