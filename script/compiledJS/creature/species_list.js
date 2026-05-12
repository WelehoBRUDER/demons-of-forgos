"use strict";
class SpeciesManager {
    speciesData;
    constructor() {
        this.speciesData = new Map();
    }
    addSpecies(species) {
        this.speciesData.set(species.id, species);
    }
    getSpeciesById(id) {
        return this.speciesData.get(id);
    }
}
const speciesManager = new SpeciesManager();
speciesManager.addSpecies(new Species({
    id: "human",
    type: SpeciesType.HUMANOID,
    size: SizeCategory.MEDIUM,
}));
//# sourceMappingURL=species_list.js.map