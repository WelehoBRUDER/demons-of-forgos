"use strict";
class Feat {
    id;
    modifiers;
    constructor(data) {
        this.id = data.id;
        this.modifiers = data.modifiers;
    }
    getId() {
        return this.id;
    }
    getModifiers() {
        return this.modifiers;
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