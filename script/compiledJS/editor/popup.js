"use strict";
class PopUp {
    popUpElement = document.querySelector(".editor-popup");
    contentElement = this.popUpElement?.querySelector(".content");
    show() {
        this.popUpElement?.classList.remove("hidden");
    }
    hide() {
        this.popUpElement?.classList.add("hidden");
    }
    showMapLoadList() {
        this.contentElement.innerHTML = "";
        const maps = Array.from(mapManager.maps.values());
        const title = document.createElement("h2");
        title.textContent = "Load Map";
        this.contentElement.appendChild(title);
        maps.forEach((map) => {
            const mapContainer = document.createElement("div");
            mapContainer.classList.add("map-load-item");
            const mapInfo = document.createElement("p");
            mapInfo.textContent = `ID: ${map.id} | Size: ${map.width}x${map.height}`;
            mapContainer.appendChild(mapInfo);
            const mapButton = document.createElement("button");
            mapButton.textContent = "Load";
            mapButton.addEventListener("click", () => {
                editor.setMode(EditorMode.select);
                editor.setSelectedObjects([]);
                mapRenderer.setMapData(map);
                mapRenderer.renderVisibleMap(camera);
                this.hide();
            });
            mapContainer.appendChild(mapButton);
            this.contentElement.appendChild(mapContainer);
        });
        this.show();
    }
    showNewMapOptions() {
        this.contentElement.innerHTML = "";
        const title = document.createElement("h2");
        title.textContent = "New Map Options";
        this.contentElement.appendChild(title);
        const idContainer = document.createElement("div");
        idContainer.classList.add("map-load-item");
        const idLabel = document.createElement("label");
        idLabel.textContent = "Map ID:";
        const idInput = document.createElement("input");
        idInput.type = "text";
        idInput.value = `empty_map_${mapManager.maps.size}`;
        idContainer.append(idLabel, idInput);
        this.contentElement.appendChild(idContainer);
        const widthContainer = document.createElement("div");
        widthContainer.classList.add("map-load-item");
        const widthLabel = document.createElement("label");
        widthLabel.textContent = "Width:";
        const widthInput = document.createElement("input");
        widthInput.type = "number";
        widthInput.value = "20";
        widthContainer.append(widthLabel, widthInput);
        this.contentElement.appendChild(widthContainer);
        const heightContainer = document.createElement("div");
        heightContainer.classList.add("map-load-item");
        const heightLabel = document.createElement("label");
        heightLabel.textContent = "Height:";
        const heightInput = document.createElement("input");
        heightInput.type = "number";
        heightInput.value = "20";
        heightContainer.append(heightLabel, heightInput);
        this.contentElement.appendChild(heightContainer);
        const tileIndexContainer = document.createElement("div");
        tileIndexContainer.classList.add("map-load-item");
        const tileIndexLabel = document.createElement("label");
        tileIndexLabel.textContent = "Base Tile Index:";
        const tileIndexInput = document.createElement("input");
        tileIndexInput.type = "number";
        tileIndexInput.value = "0";
        tileIndexContainer.append(tileIndexLabel, tileIndexInput);
        this.contentElement.appendChild(tileIndexContainer);
        const createButton = document.createElement("button");
        createButton.textContent = "Create";
        createButton.addEventListener("click", () => {
            const tileIndex = parseInt(tileIndexInput.value);
            const width = parseInt(widthInput.value);
            const height = parseInt(heightInput.value);
            const id = idInput.value.trim() || `empty_map_${mapManager.maps.size}`;
            const newMap = generateEmptyMap(width, height, tileIndex, id);
            mapManager.addMap(newMap.getStrippedMapData());
            mapRenderer.setMapData(newMap);
            mapRenderer.renderVisibleMap(camera);
            this.hide();
        });
        this.contentElement.appendChild(createButton);
        this.show();
    }
}
const popUp = new PopUp();
//# sourceMappingURL=popup.js.map