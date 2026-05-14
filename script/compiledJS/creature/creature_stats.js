"use strict";
class CreatureStats {
    owner;
    abilityScores;
    faction;
    sizeCategory;
    hp;
    constructor(owner, stats) {
        this.owner = owner;
        this.abilityScores = stats.abilityScores
            ? { ...stats.abilityScores }
            : {
                ...defaultAbilityScores,
            };
        this.faction = stats.faction || Faction.NEUTRAL;
        this.sizeCategory = stats.sizeCategory || SizeCategory.MEDIUM;
        if (stats.hp !== undefined) {
            this.hp = stats.hp;
        }
        else {
            this.resetHP(); // Ensure HP is set to max HP on initialization
        }
    }
    calcAbilityModifierFromScore(score) {
        return Math.floor((score - 10) / 2);
    }
    getAbilityScores() {
        const scores = { ...this.abilityScores };
        for (const ability in scores) {
            const bonuses = modifierManager.getTotalModifier(ability, this.owner, {});
            scores[ability] += bonuses;
        }
        return scores;
    }
    getAbilityScoreModifiers() {
        const scores = this.getAbilityScores();
        return {
            strength: this.calcAbilityModifierFromScore(scores.strength),
            dexterity: this.calcAbilityModifierFromScore(scores.dexterity),
            constitution: this.calcAbilityModifierFromScore(scores.constitution),
            intelligence: this.calcAbilityModifierFromScore(scores.intelligence),
            wisdom: this.calcAbilityModifierFromScore(scores.wisdom),
            charisma: this.calcAbilityModifierFromScore(scores.charisma),
        };
    }
    getSizeCategoryId() {
        return SizeCategory[this.sizeCategory];
    }
    getSizeCategory() {
        return this.sizeCategory;
    }
    getSizeProvider() {
        return Size.getProvider(this.sizeCategory);
    }
    getFaction() {
        return this.faction;
    }
    setFaction(faction) {
        this.faction = faction;
    }
    getMaxHP() {
        let base = 0;
        const flatBonus = modifierManager.getTotalModifier("hp", this.owner, {});
        const hitDieBonus = modifierManager.getTotalModifier("hp.per_hitDie", this.owner, {});
        const constitutionBonus = this.getAbilityScoreModifiers().constitution;
        const hitDice = this.owner.getHitDice();
        if (!hitDice)
            return 1;
        Object.values(hitDice).forEach((hitDieInfo) => {
            base += hitDieInfo.count * (hitDieInfo.type / 2 + 1); // Average roll of the hit die, e.g. D6 averages to 3.5, so (6/2)+1 = 4
            base += hitDieInfo.count * (hitDieBonus + constitutionBonus); // Add any per-hit-die bonuses
        });
        Math.floor(base);
        return base + flatBonus;
    }
    getHpPercentage() {
        return Math.max(0, this.hp / this.getMaxHP());
    }
    setHP(amount) {
        this.hp = amount;
        this.hp = Math.min(this.hp, this.getMaxHP()); // Ensure HP does not exceed max HP
    }
    resetHP() {
        this.setHP(this.getMaxHP());
    }
    getHP() {
        return this.hp;
    }
    getAC() {
        let ac = 10;
        let touchAC = 10;
        let flatFootedAC = 10;
        const dexBonus = this.getAbilityScoreModifiers().dexterity;
        const limit = this.owner.dexToACLimit();
        ac += Math.min(dexBonus, limit);
        touchAC += Math.min(dexBonus, limit);
        const acBonuses = modifierManager.getTotalModifier("ac", this.owner, null, { groupedByType: true });
        for (const modType in acBonuses) {
            const value = acBonuses[modType] || 0;
            if (modType === ModifierType.armor || modType === ModifierType.shield || modType === ModifierType.naturalArmor) {
                ac += value;
                flatFootedAC += value;
            }
            else {
                ac += value;
                touchAC += value;
                flatFootedAC += value;
            }
        }
        // Future: Add armor, shields, natural armor, magical effects, etc.
        return {
            full: ac,
            touch: touchAC,
            flatFooted: flatFootedAC,
        };
    }
}
//# sourceMappingURL=creature_stats.js.map