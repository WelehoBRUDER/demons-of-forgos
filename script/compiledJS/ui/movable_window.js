"use strict";
class MovableWindow {
    element;
    content;
    width = 30;
    height = 20;
    constructor(content, width = 30, height = 20) {
        this.element = document.createElement("div");
        this.element.classList.add("movable-window");
        const topBar = document.createElement("div");
        const closeButton = document.createElement("button");
        topBar.classList.add("window-top-bar");
        topBar.classList.add("drag-area");
        closeButton.classList.add("window-close-button");
        closeButton.textContent = "X";
        closeButton.addEventListener("click", () => this.hide());
        topBar.append(closeButton);
        this.element.append(topBar);
        this.content = content;
        if (this.content) {
            this.element.append(this.content.getElement());
        }
        this.setSize(width, height);
        drag.add(this.element, [], () => this.update());
    }
    setSize(width, height) {
        this.width = width;
        this.height = height;
        this.element.style.setProperty("--w", `${width}rem`);
        this.element.style.setProperty("--h", `${height}rem`);
    }
    getElement() {
        return this.element;
    }
    show() {
        this.element.classList.remove("hidden");
    }
    hide() {
        this.element.classList.add("hidden");
    }
    update() {
        if (this.content) {
            this.content.update();
        }
    }
}
class WindowManager {
    windows = new Map();
    addWindow(id, window, width = 30, height = 20) {
        const existingWindow = this.windows.get(id);
        if (existingWindow) {
            existingWindow.show();
            existingWindow.update();
            return;
        }
        const movableWindow = new MovableWindow(window, width, height);
        this.windows.set(id, movableWindow);
        gameWindow.append(movableWindow.getElement());
    }
    getWindow(id) {
        return this.windows.get(id);
    }
}
const windowManager = new WindowManager();
//# sourceMappingURL=movable_window.js.map