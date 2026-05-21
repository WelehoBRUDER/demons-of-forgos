"use strict";
class Feat {
    id;
    modifiers;
    requiredParams;
    constructor(data) {
        this.id = data.id;
        this.modifiers = data.modifiers;
        this.requiredParams = data.requiredParams;
    }
    getId() {
        return this.id;
    }
    getModifiers() {
        return this.modifiers;
    }
    getRequiredParams() {
        return this.requiredParams;
    }
}
class FeatManager {
    feats = new Map();
    addFeat(feat) {
        this.feats.set(feat.getId(), feat);
    }
    getFeat(id) {
        return this.feats.get(id);
    }
    getAllFeats() {
        return Array.from(this.feats.values());
    }
}
const featManager = new FeatManager();
//# sourceMappingURL=feat.js.map