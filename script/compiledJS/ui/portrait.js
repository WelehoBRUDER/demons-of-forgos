"use strict";
class PortraitManager {
    portraitContainer = document.querySelector(".character-portraits");
    portraits = new Map();
    constructor() {
        this.generateAllPortraits();
    }
    updatePortrait(creatureUID) {
        const portrait = this.portraits.get(creatureUID);
        if (portrait) {
            portrait.updatePortrait();
        }
        else {
            this.generateAllPortraits(); // If portrait doesn't exist, regenerate all portraits to ensure it's created. This is a fallback and can be optimized later.
        }
    }
    generateAllPortraits() {
        this.portraitContainer.innerHTML = "";
        const creatures = entityManager.getCreaturesByFaction(Faction.FRIENDLY);
        creatures.forEach((creature) => {
            const portrait = this.generatePortrait(creature);
            this.portraitContainer.append(portrait.getElement());
            portrait.updatePortrait(); // Initial update to render the portrait with the creature's current state
        });
    }
    generatePortrait(creature) {
        const portrait = new Portrait(creature.getUID());
        this.portraits.set(creature.getUID(), portrait);
        return portrait;
    }
}
class Portrait {
    creatureUID;
    element;
    canvas;
    ctx;
    healthText;
    nameText;
    acText;
    constructor(creatureUID) {
        this.creatureUID = creatureUID;
        this.element = document.createElement("div");
        this.element.classList.add("character-portrait");
        this.canvas = document.createElement("canvas");
        this.canvas.width = 128;
        this.canvas.height = 128;
        this.ctx = this.canvas.getContext("2d");
        const textContainer = document.createElement("div");
        textContainer.classList.add("portrait-text");
        this.healthText = document.createElement("p");
        this.nameText = document.createElement("p");
        this.acText = document.createElement("p");
        this.element.append(this.canvas);
        textContainer.append(this.nameText, this.acText, this.healthText);
        this.element.append(textContainer);
    }
    getElement() {
        return this.element;
    }
    updatePortrait() {
        const creature = entityManager.getCreatureByUID(this.creatureUID);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        mapRenderer.drawCreaturePortrait(creature, this.ctx);
        this.updateHealth(creature.stats.getHP(), creature.stats.getMaxHP());
        this.nameText.textContent = creature.getTemplateId();
        const { full, flatFooted, touch } = creature.stats.getAC();
        this.acText.textContent = `AC: ${full} (Flat-Footed: ${flatFooted}, Touch: ${touch})`;
    }
    updateHealth(hp, maxHp) {
        const creature = entityManager.getCreatureByUID(this.creatureUID);
        const attackResults = creature?.combat.getAttackResults();
        this.healthText.textContent = `${hp}/${maxHp} HP`;
    }
}
const portraitManager = new PortraitManager();
//# sourceMappingURL=portrait.js.map