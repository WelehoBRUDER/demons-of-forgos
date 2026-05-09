"use strict";
class PropPaintCommand {
    id;
    affectedProps;
    constructor(affectedProps) {
        this.id = `paintProp_${affectedProps[0].x}_${affectedProps[0].y}`;
        this.affectedProps = affectedProps;
    }
    do(state) {
        const index = this.affectedProps[0].y * editor.getMap().width + this.affectedProps[0].x;
        if (index < 0 || index >= state.props.length) {
            console.error(`Prop coordinates (${this.affectedProps[0].x}, ${this.affectedProps[0].y}) are out of bounds.`);
            return;
        }
        for (const prop of this.affectedProps) {
            const propIndex = prop.y * editor.getMap().width + prop.x;
            if (propIndex < 0 || propIndex >= state.props.length) {
                console.error(`Prop coordinates (${prop.x}, ${prop.y}) are out of bounds.`);
                continue;
            }
            state.props[propIndex] = prop.after; // Update prop ID in state
        }
    }
    undo(state) {
        const index = this.affectedProps[0].y * editor.getMap().width + this.affectedProps[0].x;
        if (index < 0 || index >= state.props.length) {
            console.error(`Prop coordinates (${this.affectedProps[0].x}, ${this.affectedProps[0].y}) are out of bounds.`);
            return;
        }
        for (const prop of this.affectedProps) {
            const propIndex = prop.y * editor.getMap().width + prop.x;
            if (propIndex < 0 || propIndex >= state.props.length) {
                console.error(`Prop coordinates (${prop.x}, ${prop.y}) are out of bounds.`);
                continue;
            }
            state.props[propIndex] = prop.before; // Revert prop ID in state
        }
    }
}
//# sourceMappingURL=prop_paint_command.js.map