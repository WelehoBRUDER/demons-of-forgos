interface FeatData {
	id: string;
	requiredParams?: [keyof FeatParams];
	modifiers: Modifier[];
}

interface FeatParams {
	weapon?: string;
	armor?: string;
	skill?: string;
}

interface FeatInstance {
	feat: string;
	params?: FeatParams;
}

class Feat implements ModifierProvider {
	private id: string;
	private modifiers: Modifier[];
	private requiredParams: [keyof FeatParams] | undefined;

	constructor(data: FeatData) {
		this.id = data.id;
		this.modifiers = data.modifiers;
		this.requiredParams = data.requiredParams;
	}

	getId(): string {
		return this.id;
	}

	getModifiers(): Modifier[] {
		return this.modifiers;
	}

	getRequiredParams(): [keyof FeatParams] | undefined {
		return this.requiredParams;
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
