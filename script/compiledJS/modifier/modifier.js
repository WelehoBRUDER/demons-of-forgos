"use strict";
var Operation;
(function (Operation) {
    Operation[Operation["add"] = 0] = "add";
    Operation[Operation["multiply"] = 1] = "multiply";
    Operation[Operation["override"] = 2] = "override";
})(Operation || (Operation = {}));
var ModifierType;
(function (ModifierType) {
    ModifierType["alchemical"] = "alchemical";
    ModifierType["armor"] = "armor";
    ModifierType["circumstance"] = "circumstance";
    ModifierType["competence"] = "competence";
    ModifierType["deflection"] = "deflection";
    ModifierType["enhancement"] = "enhancement";
    ModifierType["inherent"] = "inherent";
    ModifierType["insight"] = "insight";
    ModifierType["luck"] = "luck";
    ModifierType["morale"] = "morale";
    ModifierType["naturalArmor"] = "naturalArmor";
    ModifierType["profane"] = "profane";
    ModifierType["resistance"] = "resistance";
    ModifierType["sacred"] = "sacred";
    ModifierType["shield"] = "shield";
    ModifierType["size"] = "size";
    ModifierType["untyped"] = "untyped";
    ModifierType["dodge"] = "dodge";
})(ModifierType || (ModifierType = {}));
class ModifierManager {
    stacks(type) {
        // Define which modifier types stack and which don't
        const stackingTypes = new Set([ModifierType.untyped, ModifierType.dodge, ModifierType.circumstance]);
        return stackingTypes.has(type);
    }
    // Mainly for modifiers that don't stack, since the highest value applies.
    getExistingModifier(target, type, modifiers) {
        return modifiers.find((mod) => mod.target === target && mod.type === type) || null;
    }
    // Groups all modifiers that are actually applied, since it is possible to have non-stacking modifiers that are overridden by higher values.
    collectModifiers(creature, context) {
        const modifiers = [];
        // Loop through each provider and collect their modifiers, applying stacking rules
        for (const provider of creature.getAllProviders()) {
            const providedModifiers = provider.getModifiers(creature, context);
            for (const mod of providedModifiers) {
                if (mod.enabled && !mod.enabled(creature, context))
                    continue; // Skip disabled modifiers
                const existing = this.getExistingModifier(mod.target, mod.type, modifiers);
                if (!existing || this.stacks(mod.type)) {
                    modifiers.push(mod);
                }
                else {
                    if (mod.evaluate(creature, context) > existing.evaluate(creature, context)) {
                        modifiers.splice(modifiers.indexOf(existing), 1, mod);
                    }
                }
            }
        }
        return modifiers;
    }
    getTotalModifier(target, creature, context, options) {
        const mods = this.collectModifiers(creature, context).filter((mod) => {
            return mod.target === target && mod.operation === Operation.add;
        });
        if (options?.groupedByType) {
            const grouped = {};
            for (const mod of mods) {
                if (!grouped[mod.type]) {
                    grouped[mod.type] = mod.evaluate(creature, context);
                }
                else {
                    grouped[mod.type] += mod.evaluate(creature, context);
                }
            }
            return grouped;
        }
        return mods.reduce((total, mod) => total + mod.evaluate(creature, context), 0);
    }
    getMultiplicationModifier(target, creature, context) {
        const mods = this.collectModifiers(creature, context).filter((mod) => {
            return mod.target === target && mod.operation === Operation.multiply;
        });
        return mods.reduce((total, mod) => total + mod.evaluate(creature, context), 1);
    }
    getTotalModifierFromMultipleSources(target, creature, context, options) {
        const mods = this.collectModifiers(creature, context).filter((mod) => {
            return target.includes(mod.target) && mod.operation === Operation.add;
        });
        if (options?.groupedByType) {
            const grouped = {};
            for (const mod of mods) {
                if (!grouped[mod.type]) {
                    grouped[mod.type] = mod.evaluate(creature, context);
                }
                else {
                    grouped[mod.type] += mod.evaluate(creature, context);
                }
            }
            return grouped;
        }
        return mods.reduce((total, mod) => total + mod.evaluate(creature, context), 0);
    }
}
const modifierManager = new ModifierManager();
//# sourceMappingURL=modifier.js.map