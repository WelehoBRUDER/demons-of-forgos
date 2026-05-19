"use strict";
class DevMode {
    ENABLED = false;
    setEnabled(enabled) {
        this.ENABLED = enabled;
    }
    IS_ENABLED() {
        return this.ENABLED;
    }
}
const generateUID = (mapId, obj) => {
    return `${mapId}:${obj.id}:${obj.x}:${obj.y}`;
};
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const DEV_MODE = new DevMode();
// Currently debugging, enable dev mode by default
DEV_MODE.setEnabled(true);
//# sourceMappingURL=dev.js.map