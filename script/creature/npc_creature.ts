interface NPCCreatureInterface extends CreatureInterface {
	species: string;
	spritePath: string;
	spritePosition?: { x: number; y: number };
}

class NPCCreature extends Creature {
	spritePath: string;
	spritePosition: { x: number; y: number };
	species: string; // Will contain species data
	constructor(data: NPCCreatureInterface) {
		super(data);
		this.spritePath = data.spritePath;
		this.spritePosition = data.spritePosition ?? { x: -1, y: -1 };
		this.species = data.species;
		this.baseClass = "NPCCreature";
	}

	setSpritePosition(x: number, y: number) {
		this.spritePosition = { x, y };
	}

	getSpritePath(): string {
		return this.spritePath;
	}

	getSpritePosition(): { x: number; y: number } {
		return this.spritePosition;
	}

	getMaxHP(): number {
		return 4;
	}

	getEditorDynamicData(): { [key: string]: EditorDynamicData } {
		return {
			uid: {
				value: this.getUID(),
				locked: true, // UID should not be edited manually to prevent issues with referencing the object in the map
				optionType: EditorDataOptionType.textInput,
				setValue: "setUID",
			},
			x: {
				value: this.getPosition().x,
				locked: false,
				optionType: EditorDataOptionType.numberInput,
				setValue: "setX",
			},
			y: {
				value: this.getPosition().y,
				locked: false,
				optionType: EditorDataOptionType.numberInput,
				setValue: "setY",
			},
		};
	}
}
