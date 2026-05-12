"use strict";
class PortraitManager {
    portraitContainer = document.querySelector(".character-portraits");
    generateAllPortraits() {
        this.portraitContainer.innerHTML = "";
        const creatures = entityManager.getCreaturesByFaction(Faction.FRIENDLY);
        creatures.forEach((creature) => {
            const portrait = this.generatePortrait(creature);
            this.portraitContainer.appendChild(portrait);
            console.log(`Generated portrait for creature ${creature.getUID()} with template ID ${creature.getTemplateId()}`);
        });
    }
    generatePortrait(creature) {
        const portraitElement = document.createElement("div");
        portraitElement.classList.add("character-portrait");
        portraitElement.innerHTML = `
      <canvas width="128" height="128"></canvas>
      <p>${creature.getTemplateId()}</p>
    `;
        const canvas = portraitElement.querySelector("canvas");
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#333";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        mapRenderer.drawCreaturePortrait(creature, ctx);
        return portraitElement;
    }
}
const portraitManager = new PortraitManager();
//# sourceMappingURL=portrait.js.map