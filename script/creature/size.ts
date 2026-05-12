enum SizeCategory {
	TINY = 0.5,
	SMALL = 0.75,
	MEDIUM = 1,
	LARGE = 2,
	HUGE = 3,
	GARGANTUAN = 4,
}

const sizeCategoryModifiers: { [key: string]: [Modifier] } = {
	TINY: [
		{
			id: "tiny_size_modifier",
			target: "ac",
			operation: Operation.add,
			evaluate: () => 2,
			type: ModifierType.size,
		},
	],
	SMALL: [
		{
			id: "small_size_modifier",
			target: "ac",
			operation: Operation.add,
			evaluate: () => 1,
			type: ModifierType.size,
		},
	],
	MEDIUM: [
		{
			id: "medium_size_modifier",
			target: "ac",
			operation: Operation.add,
			evaluate: () => 0,
			type: ModifierType.size,
		},
	],
	LARGE: [
		{
			id: "large_size_modifier",
			target: "ac",
			operation: Operation.add,
			evaluate: () => -1,
			type: ModifierType.size,
		},
	],
	HUGE: [
		{
			id: "huge_size_modifier",
			target: "ac",
			operation: Operation.add,
			evaluate: () => -2,
			type: ModifierType.size,
		},
	],
	GARGANTUAN: [
		{
			id: "gargantuan_size_modifier",
			target: "ac",
			operation: Operation.add,
			evaluate: () => -4,
			type: ModifierType.size,
		},
	],
};

class Size {
	static getSizeMultiplier(sizeCategory: SizeCategory): number {
		return sizeCategory;
	}

	static getProvider(sizeCategory: SizeCategory): SizeProvider {
		return new SizeProvider(sizeCategory);
	}

	static getMinSizeCategory(): SizeCategory {
		return SizeCategory.TINY;
	}

	static getMaxSizeCategory(): SizeCategory {
		return SizeCategory.GARGANTUAN;
	}
}

class SizeProvider implements ModifierProvider {
	private size: SizeCategory;

	constructor(size: SizeCategory) {
		this.size = size;
	}

	getModifiers(): Modifier[] {
		const key = SizeCategory[this.size];
		return sizeCategoryModifiers[key];
	}
}
