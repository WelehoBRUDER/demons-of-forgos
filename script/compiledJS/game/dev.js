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
var DebugColor;
(function (DebugColor) {
    DebugColor["RED"] = "\u001B[1;31m";
    DebugColor["GREEN"] = "\u001B[1;32m";
    DebugColor["YELLOW"] = "\u001B[1;33m";
    DebugColor["BLUE"] = "\u001B[1;34m";
    DebugColor["PURPLE"] = "\u001B[1;35m";
    DebugColor["CYAN"] = "\u001B[1;36m";
})(DebugColor || (DebugColor = {}));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const DEV_MODE = new DevMode();
// Currently debugging, enable dev mode by default
DEV_MODE.setEnabled(true);
//# sourceMappingURL=dev.js.map