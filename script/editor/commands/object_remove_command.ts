class ObjectRemoveCommand implements EditorCommand {
	private id: string;
	private objectData: StrippedObjectData;

	constructor(objectData: StrippedObjectData) {
		this.id = `removeObject_${objectData.x}_${objectData.y}_${objectData.i}`;
		this.objectData = objectData;
	}

	do(state: EditorState) {
		const index = state.objects.findIndex((obj) => obj.getUID() === this.objectData.u);
		if (index !== -1) {
			state.objects.splice(index, 1);
		}
	}

	undo(state: EditorState) {
		const obj = getDynamicObjectById(this.objectData.i)!;
		obj.restoreStrippedData(this.objectData); // Restore the object's state, position, and UID from the stripped data
		state.objects.push(obj);
	}
}
