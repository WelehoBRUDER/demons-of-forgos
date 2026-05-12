interface FeatData {
	id: string;
	modifiers: Modifier[];
}

class Feat implements ModifierProvider {
	private id: string;
	private modifiers: Modifier[];

	constructor(data: FeatData) {
		this.id = data.id;
		this.modifiers = data.modifiers;
	}

	getId(): string {
		return this.id;
	}

	getModifiers(): Modifier[] {
		return this.modifiers;
	}
}

class FeatManager {
	feats: Map<string, Feat> = new Map();

	addFeat(feat: Feat) {
		this.feats.set(feat.getId(), feat);
	}

	getFeat(id: string): Feat | undefined {
		return this.feats.get(id);
	}

	getAllFeats(): Feat[] {
		return Array.from(this.feats.values());
	}
}

const featManager = new FeatManager();
