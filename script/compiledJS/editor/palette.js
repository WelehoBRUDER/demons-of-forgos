"use strict";
class Palette {
    paletteElement = document.querySelector(".prop-tile-palette");
    paletteSearchInput = this.paletteElement.querySelector(".palette-search");
    paletteContent = this.paletteElement.querySelector(".palette-content");
    paletteTitle = document.querySelector(".palette-title");
    tiles = [];
    props = [];
    objects = [];
    creatures = [];
    imageCache = {};
    buildingPalette = false;
    filterTerm = "";
    constructor() {
        this.tiles = Object.values(tiles);
        this.props = Object.values(props);
        this.objects = Object.values(dynamicObjects);
        this.creatures = entityManager.getEnemyTemplates();
        this.paletteSearchInput.addEventListener("input", () => {
            this.filterTerm = this.paletteSearchInput.value.toLowerCase().trim();
            this.populatePalette();
        });
    }
    hide() {
        this.paletteElement.style.display = "none";
        this.paletteTitle.style.display = "none";
    }
    show() {
        this.paletteElement.style.display = "flex";
        this.paletteTitle.style.display = "block";
    }
    matchesFilter(id) {
        return this.filterTerm === "" || this.filterTerm === undefined || id.includes(this.filterTerm);
    }
    getCurrentPaletteItems() {
        const items = [];
        if (editor.getMode() === EditorMode.tile) {
            this.tiles.forEach((tile) => {
                if (this.matchesFilter(tile.getId())) {
                    items.push({ type: "tile", item: tile });
                }
            });
        }
        else if (editor.getMode() === EditorMode.prop) {
            this.props.forEach((prop) => {
                if (this.matchesFilter(prop.getId())) {
                    items.push({ type: "prop", item: prop });
                }
            });
        }
        else if (editor.getMode() === EditorMode.object) {
            this.objects.forEach((obj) => {
                if (this.matchesFilter(obj.getId())) {
                    items.push({ type: "object", item: obj });
                }
            });
        }
        else if (editor.getMode() === EditorMode.creature) {
            this.creatures.forEach((creature) => {
                if (this.matchesFilter(creature.getTemplateId())) {
                    items.push({ type: "creature", item: creature });
                }
            });
        }
        return items;
    }
    pathToId(path) {
        return path.split("/").pop()?.split(".")[0] || "";
    }
    async loadImage(path) {
        const id = this.pathToId(path);
        if (!this.imageCache[id]) {
            this.imageCache[id] = await new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = async () => {
                    try {
                        await img.decode();
                    }
                    catch { }
                    resolve(path);
                };
                img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
                img.src = path;
            });
        }
        return this.imageCache[id];
    }
    async populatePalette() {
        if (this.buildingPalette)
            return;
        this.buildingPalette = true;
        await this.emptyPaletteContent();
        if (editor.getMode() === EditorMode.tile) {
            await this.populateTilePalette();
        }
        else if (editor.getMode() === EditorMode.prop) {
            await this.populatePropPalette();
        }
        else if (editor.getMode() === EditorMode.object) {
            await this.populateObjectPalette();
        }
        else if (editor.getMode() === EditorMode.creature) {
            await this.populateCreaturePalette();
        }
        this.buildingPalette = false;
    }
    async populateTilePalette() {
        this.paletteTitle.textContent = "Tiles";
        await Promise.all(this.getCurrentPaletteItems().map(async ({ type, item }) => {
            const tileElement = await this.createPaletteItem(item.getId(), item.getTexturePath(), item.getIndex() === editor.getTileBrush(), () => {
                editor.setTileBrush(item.getIndex());
            });
            this.paletteContent.appendChild(tileElement);
        }));
    }
    async populatePropPalette() {
        this.paletteTitle.textContent = "Props";
        await Promise.all(this.getCurrentPaletteItems().map(async ({ type, item }) => {
            const propElement = await this.createPaletteItem(item.getId(), item.getTexturePath(), item.getIndex() === editor.getPropBrush(), () => {
                editor.setPropBrush(item.getIndex());
            });
            this.paletteContent.appendChild(propElement);
        }));
    }
    async populateObjectPalette() {
        this.paletteTitle.textContent = "Objects";
        await Promise.all(this.getCurrentPaletteItems().map(async ({ type, item }) => {
            console.log(item);
            const objectElement = await this.createPaletteItem(item.getId(), item.getTexturePath(), item.getId() === editor.getObjectBrush(), () => {
                editor.setObjectBrush(item.getId());
            });
            this.paletteContent.appendChild(objectElement);
        }));
    }
    async populateCreaturePalette() {
        this.paletteTitle.textContent = "Creatures";
        await Promise.all(this.getCurrentPaletteItems().map(async ({ type, item }) => {
            const creatureElement = await this.createPaletteItem(item.getTemplateId(), item.getSpritePath(), item.getTemplateId() === editor.getCreatureBrush(), () => {
                editor.setCreatureBrush(item.getTemplateId());
            });
            this.paletteContent.appendChild(creatureElement);
        }));
    }
    async createPaletteItem(name, imagePath, selected, onClick) {
        await this.loadImage(imagePath);
        const itemElement = document.createElement("div");
        itemElement.classList.add("palette-item");
        itemElement.textContent = name;
        itemElement.addEventListener("click", onClick);
        if (selected) {
            itemElement.classList.add("selected");
        }
        const img = document.createElement("img");
        img.width = 64;
        img.height = 64;
        img.src = imagePath;
        itemElement.appendChild(img);
        return itemElement;
    }
    async emptyPaletteContent() {
        while (this.paletteContent.firstChild) {
            this.paletteContent.removeChild(this.paletteContent.firstChild);
        }
        return Promise.resolve();
    }
}
const palette = new Palette();
//# sourceMappingURL=palette.js.map