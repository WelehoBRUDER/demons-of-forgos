"use strict";
class Drag {
    dragging = false;
    startX = 0;
    startY = 0;
    positions = { pos1: 0, pos2: 0 };
    click = false;
    mouseHeldTimeout;
    element = null;
    snapContainers = [];
    add(elem, snapContainers, onClick, onRelease) {
        const dragTimeout = snapContainers?.length > 0 ? 200 : 0;
        console.log("Adding drag to element:", elem, "with snap containers:", snapContainers, "drag timeout:", dragTimeout);
        this.snapContainers = snapContainers || [];
        const dragArea = elem.querySelector(".drag-area") ? elem.querySelector(".drag-area") : elem;
        dragArea.addEventListener("mousedown", (e) => {
            this.click = true;
            clearTimeout(this.mouseHeldTimeout);
            this.element = elem;
            this.snapContainers = snapContainers || [];
            this.mouseHeldTimeout = setTimeout(() => this.dragMouse(), dragTimeout);
        });
        dragArea.addEventListener("mouseup", () => {
            clearTimeout(this.mouseHeldTimeout);
            this.element = null;
        });
    }
    dragMouse() {
        this.click = false;
        const { x: clientX, y: clientY } = game.getMousePosition();
        const rect = this.element.getBoundingClientRect();
        this.positions.pos1 = clientX - rect.left;
        this.positions.pos2 = clientY - rect.top;
        //this.element!.style.position = "absolute";
        this.element.style.zIndex = "1000";
        this.dragging = true;
    }
    dragElement(e) {
        if (!this.element)
            return;
        e.preventDefault();
        this.element.style.left = `${e.clientX - this.positions.pos1}px`;
        this.element.style.top = `${e.clientY - this.positions.pos2}px`;
    }
    releaseElement(e) {
        this.dragging = false;
        if (!this.element)
            return;
        this.element.style.zIndex = "20";
        this.resetElement();
    }
    resetElement(callback) {
        if (callback)
            callback();
        this.element = null;
        this.snapContainers = [];
        this.positions = { pos1: 0, pos2: 0 };
    }
}
const drag = new Drag();
//# sourceMappingURL=drag.js.map