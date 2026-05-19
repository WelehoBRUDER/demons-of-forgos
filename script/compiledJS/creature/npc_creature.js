"use strict";
class BaseCreatureModifierProvider {
    modifiers;
    constructor(modifiers) {
        this.modifiers = modifiers;
    }
    getModifiers(ctx) {
        return this.modifiers;
    }
}
class NPCCreature extends Creature {
    spritePath;
    spritePosition;
    species; // Will contain species data
    baseHitDice; // Default hit die, can be overridden by specific NPC data
    modifiers; // Modifiers specific to this NPC, such as racial traits, class features, etc.
    constructor(data) {
        super(data);
        //console.log("\u001b[1;35m Creating NPCCreature with data:", data);
        this.spritePath = data.spritePath;
        this.spritePosition = data.spritePosition ?? { x: -1, y: -1 };
        this.species = data.species;
        this.baseClass = "NPCCreature";
        if (data.baseHitDice) {
            this.baseHitDice = { ...data.baseHitDice };
        }
        if (data.modifiers) {
            const provider = new BaseCreatureModifierProvider(data.modifiers);
            this.modifiers = provider;
        }
        if (data.equipment) {
            for (const slot in data.equipment) {
                const item = data.equipment[slot];
                if (item) {
                    this.inventory.equipItem(item, slot);
                }
            }
        }
        this.combat.bab = data.bab ?? 0;
        this.stats.setHP(data?.stats?.hp ?? this.stats.getMaxHP()); // Set HP to provided value or max HP if not provided
        this.providersNeedUpdate = true; // Mark providers as needing update to ensure modifiers are included in calculations
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
    getHitDice() {
        return this.baseHitDice;
    }
    getAllProviders() {
        const baseProviders = super.getAllProviders();
        if (this.providersNeedUpdate) {
            baseProviders.push(this.modifiers);
            this.providers = baseProviders;
        }
        return baseProviders;
    }
    getAggroRange() {
        // Example implementation, can be customized based on NPC type or other factors
        return 8; // Default aggro range of 8 tiles
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