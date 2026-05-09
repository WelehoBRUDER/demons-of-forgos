"use strict";
class NPCCreature extends Creature {
    spritePath;
    spritePosition;
    species; // Will contain species data
    constructor(data) {
        super(data);
        this.spritePath = data.spritePath;
        this.spritePosition = data.spritePosition ?? { x: -1, y: -1 };
        this.species = data.species;
        this.baseClass = "NPCCreature";
    }
    setSpritePosition(x, y) {
        this.spritePosition = { x, y };
    }
    getSpritePath() {
        return this.spritePath;
    }
    getSpritePosition() {
        return this.spritePosition;
    }
    getMaxHP() {
        return 4;
    }
    getEditorDynamicData() {
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
//# sourceMappingURL=npc_creature.js.map