class SpeciesManager {
	speciesData: Map<string, Species>;
	constructor() {
		this.speciesData = new Map<string, Species>();
	}

	addSpecies(species: Species) {
		this.speciesData.set(species.id, species);
	}

	getSpeciesById(id: string): Species | undefined {
		return this.speciesData.get(id);
	}
}

const speciesManager = new SpeciesManager();

speciesManager.addSpecies(
	new Species({
		id: "human",
		type: SpeciesType.HUMANOID,
		size: SizeCategory.MEDIUM,
	}),
);
