class PropPaintCommand implements EditorCommand {
	private id: string;
	private affectedProps: affectedTile[];

	constructor(affectedProps: affectedTile[]) {
		this.id = `paintProp_${affectedProps[0].x}_${affectedProps[0].y}`;
		this.affectedProps = affectedProps;
	}

	do(state: EditorState) {
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

	undo(state: EditorState) {
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
