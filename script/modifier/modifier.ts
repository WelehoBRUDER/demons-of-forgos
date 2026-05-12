enum Operation {
	add,
	multiply,
	override,
}

enum ModifierType {
	alchemical = "alchemical",
	armor = "armor",
	circumstance = "circumstance",
	competence = "competence",
	deflection = "deflection",
	enhancement = "enhancement",
	inherent = "inherent",
	insight = "insight",
	luck = "luck",
	morale = "morale",
	naturalArmor = "naturalArmor",
	profane = "profane",
	resistance = "resistance",
	sacred = "sacred",
	shield = "shield",
	size = "size",
	untyped = "untyped",
	dodge = "dodge",
}

type Modifier = {
	id: string;
	target: string;
	operation: Operation;
	evaluate: (creature: Creature, ctx: any) => number; // Optional function to calculate the modifier value based on context
	type: ModifierType;
	sourceType?: string;
	sourceId?: string;
	enabled?: (creature: Creature, ctx: any) => boolean;
	tags?: string[]; // Optional tags for additional categorization or filtering
};

type GroupedModifiers = { [key in ModifierType as ModifierType]?: number };

interface ModifierProvider {
	getModifiers(creature: Creature, ctx: any): Modifier[];
}

class ModifierManager {
	stacks(type: ModifierType): boolean {
		// Define which modifier types stack and which don't
		const stackingTypes = new Set<ModifierType>([ModifierType.untyped, ModifierType.dodge, ModifierType.circumstance]);
		return stackingTypes.has(type);
	}

	// Mainly for modifiers that don't stack, since the highest value applies.
	getExistingModifier(target: string, type: ModifierType, modifiers: Modifier[]): Modifier | null {
		return modifiers.find((mod) => mod.target === target && mod.type === type) || null;
	}

	// Groups all modifiers that are actually applied, since it is possible to have non-stacking modifiers that are overridden by higher values.
	collectModifiers(creature: Creature, context: any): Modifier[] {
		const modifiers: Modifier[] = [];

		// Loop through each provider and collect their modifiers, applying stacking rules
		for (const provider of creature.getAllProviders()) {
			const providedModifiers = provider.getModifiers(creature, context);

			for (const mod of providedModifiers) {
				if (mod.enabled && !mod.enabled(creature, context)) continue; // Skip disabled modifiers
				const existing = this.getExistingModifier(mod.target, mod.type, modifiers);

				if (!existing || this.stacks(mod.type)) {
					modifiers.push(mod);
				} else {
					if (mod.evaluate(creature, context) > existing.evaluate(creature, context)) {
						modifiers.splice(modifiers.indexOf(existing), 1, mod);
					}
				}
			}
		}
		return modifiers;
	}

	getTotalModifier(
		target: string,
		creature: Creature,
		context: any,
		options?: { groupedByType?: boolean },
	): number | { [key in ModifierType]?: number } {
		const mods: Modifier[] = this.collectModifiers(creature, context).filter((mod) => mod.target === target);
		if (options?.groupedByType) {
			const grouped: GroupedModifiers = {};
			for (const mod of mods) {
				if (!grouped[mod.type]) {
					grouped[mod.type] = mod.evaluate(creature, context);
				} else {
					grouped[mod.type]! += mod.evaluate(creature, context);
				}
			}
			return grouped;
		}
		return mods.reduce((total, mod) => total + mod.evaluate(creature, context), 0);
	}
}

const modifierManager = new ModifierManager();
