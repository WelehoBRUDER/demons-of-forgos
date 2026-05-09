class ObjectPlaceCommand implements EditorCommand {
	private id: string;
	private objectData: StrippedObjectData;

	constructor(objectData: StrippedObjectData) {
		this.id = `addObject_${objectData.x}_${objectData.y}_${objectData.i}`;
		this.objectData = objectData;
	}

	do(state: EditorState) {
		const obj = getDynamicObjectById(this.objectData.i)!;
		obj.restoreStrippedData(this.objectData); // Restore the object's state, position, and UID from the stripped data
		if (!obj.getUID()) {
			obj.setUID(generateUID(editor.getMap().id, obj)); // Generate a new UID if it doesn't exist (for new objects)
			this.objectData.u = obj.getUID(); // Update the stripped data with the new UID for undo functionality
		}
		state.objects.push(obj);
	}

	undo(state: EditorState) {
		const index = state.objects.findIndex((obj) => obj.getUID() === this.objectData.u);
		if (index !== -1) {
			state.objects.splice(index, 1);
		}
	}
}
