"use strict";
class CreatureCombat {
    owner;
    bab;
    initiative;
    actions;
    turnEnd; // This is used by the player to indicate they have finished their turn
    movement = 0;
    constructor(owner, combatData) {
        this.owner = owner;
        this.bab = combatData?.bab || 0;
        this.initiative = combatData?.initiative || -Infinity; // -Infinity means initiative has not been rolled yet
        this.actions = combatData?.actions || {
            [Action.STANDARD]: 1,
            [Action.MOVE]: 1,
            [Action.FULL_ROUND]: 1,
            [Action.SWIFT]: 1,
        };
        this.turnEnd = false; // This is used by the player
        this.movement = this.owner.getMoveSpeed();
    }
    getAttackRange(weapon) {
        const weaponRange = weapon.getRange();
        if (weapon.getWeaponType() === WeaponType.RANGED) {
            return weaponRange;
        }
        const bonusRange = modifierManager.getTotalModifier(AttackBonusType.MELEE_REACH, this.owner, {});
        return weaponRange + bonusRange;
    }
    getBaseAttackBonus() {
        return this.bab; // This should be calculated based on class levels for player characters or set as a static value for enemies
    }
    buildAttack(ctx) {
        const weapon = ctx.weapon;
        const damageDice = this.handleDamageDieProgression(weapon.getDamage());
        const attackBonus = this.getWeaponAttackBonus(ctx);
        const [damageMin, damageMax] = this.calculateBaseDamage(damageDice, ctx);
        const critRange = weapon.getCritRange();
        const critMultiplier = weapon.getCritMultiplier();
        console.log(`BUILDING ATTACK: Weapon: ${weapon.getId()}, Attack Bonus: ${attackBonus}, Damage: ${damageMin}-${damageMax} ${weapon.getDamageType()}, Crit Range: ${critRange}-20, Crit Multiplier: x${critMultiplier} | CREATURE: ${this.owner.getUID()}`);
        return {
            weapon,
            attackBonus,
            attackRange: this.getAttackRange(weapon),
            damageMin,
            damageMax,
            damageType: weapon.getDamageType(),
            criticalThreatRange: critRange,
            criticalMultiplier: critMultiplier,
        };
    }
    hasPerformedAction() {
        return false;
    }
    hasEndedTurn() {
        return this.turnEnd;
    }
    getAttackResults() {
        return this.owner.inventory.getEquippedWeapons().map((ctx) => this.buildAttack(ctx));
    }
    formatAttackResult(attackResult) {
        if (!attackResult)
            return "";
        const criticalThreatRangeText = attackResult.criticalThreatRange < 20 ? `${attackResult.criticalThreatRange}-20` : "20";
        const attackBonusText = attackResult.attackBonus >= 0 ? `+${attackResult.attackBonus}` : `${attackResult.attackBonus}`;
        return `${attackResult.weapon.getId()} ${attackBonusText} to hit, Damage: ${attackResult.damageMin}-${attackResult.damageMax} ${attackResult.damageType}, Crit: ${criticalThreatRangeText} x${attackResult.criticalMultiplier}`;
    }
    getWeaponAttackBonus(ctx) {
        const weapon = ctx.weapon;
        const weaponType = weapon.getWeaponType();
        const attackType = weaponType === WeaponType.MELEE ? AttackBonusType.MELEE : AttackBonusType.RANGED;
        // BAB
        const baseAttackBonus = this.getBaseAttackBonus();
        // Ability modifier
        const abilityModifier = weapon.isFinesse()
            ? Math.max(this.owner.stats.getAbilityScoreModifiers().strength, this.owner.stats.getAbilityScoreModifiers().dexterity)
            : this.owner.stats.getAbilityScoreModifiers().strength;
        let penalty = 0;
        if (ctx.isDualWielding) {
            penalty = ctx.isPrimary ? -6 : -10;
            if (ctx.offhandIsLight) {
                penalty += 2; // Light off-hand weapons reduce the dual-wielding penalty by 2
            }
        }
        // Modifiers from feats, equipment, buffs, etc.
        const modBonuses = modifierManager.getTotalModifier(attackType, this.owner, ctx);
        const weaponBonuses = modifierManager.getTotalModifier(AttackBonusType.WEAPON, this.owner, ctx);
        console.log(`---------------- CREATURE ${this.owner.getUID()} ATTACK CALCULATION ----------------`);
        console.log("IS DUAL WIELDING:", ctx.isDualWielding);
        console.log(`Attack Type: ${attackType}, Base Attack Bonus: ${baseAttackBonus}, Ability Modifier: ${abilityModifier}, Penalty: ${penalty}`);
        console.log(`Modifiers: ${modBonuses} (from feats, equipment, buffs, etc.)`);
        console.log(`Weapon Bonuses: ${weaponBonuses}`);
        return baseAttackBonus + abilityModifier + modBonuses + weaponBonuses + penalty;
    }
    calculateBaseDamage(dice, ctx) {
        const minDamage = dice.count; // Minimum damage is the number of dice (e.g. 2d6 has a minimum of 2)
        const maxDamage = dice.count * dice.type; // Maximum damage is the number of dice times the type (e.g. 2d6 has a maximum of 12)
        let bonusDamage = 0; // This will be calculated from ability modifiers, feats, equipment, etc.
        const attackType = ctx.weapon.getWeaponType() === WeaponType.MELEE ? AttackBonusType.MELEE_DAMAGE : AttackBonusType.RANGED_DAMAGE;
        const modBonuses = modifierManager.getTotalModifier(attackType, this.owner, ctx);
        const weaponBonuses = modifierManager.getTotalModifier(AttackBonusType.WEAPON_DAMAGE, this.owner, ctx);
        bonusDamage += modBonuses;
        bonusDamage += weaponBonuses;
        bonusDamage += this.getStrengthBasedDamageBonus(ctx); // Calculate strength-based damage bonus based on attack context
        const totalMinDamage = minDamage + bonusDamage;
        const totalMaxDamage = maxDamage + bonusDamage;
        return [totalMinDamage, totalMaxDamage]; // Return min and max damage for simplicity, can be changed to a random roll if desired
    }
    getStrengthBasedDamageBonus(ctx) {
        const str = this.owner.stats.getAbilityScoreModifiers().strength;
        if (ctx.weapon.getWeaponType() === WeaponType.RANGED) {
            return ctx.weapon.isComposite() ? str : 0; // Composite bows add strength bonus to damage, regular ranged weapons do not
        }
        if (ctx.isOffHand) {
            return Math.floor(str / 2); // Off-hand attacks typically get half the strength bonus
        }
        if (ctx.heldInTwoHands) {
            return Math.floor(str * 1.5); // Two-handed attacks typically get 1.5 times the strength bonus
        }
        return str; // Normal strength bonus for one-handed attacks
    }
    handleDamageDieProgression(damage) {
        // Default behavior
        const sizeCategory = this.owner.stats.getSizeCategory();
        if (sizeCategory < SizeCategory.MEDIUM) {
            // Weapon damage dice are reduced
            damage = DamageProgression.getPreviousDamage(damage);
        }
        else if (sizeCategory > SizeCategory.MEDIUM) {
            // Weapon damage dice are increased
            damage = DamageProgression.getNextDamage(damage, 2 * (sizeCategory - SizeCategory.MEDIUM)); // Increase damage by 2 steps for each size category above medium
        }
        return damage;
    }
    getAttackIterations() {
        const attackCount = {
            [AttackIteration.PRIMARY]: 0,
            [AttackIteration.OFFHAND]: 0,
            [AttackIteration.PRIMARY_FULL]: 0,
        };
        const bab = this.getBaseAttackBonus();
        const iterations = Math.max(Math.floor((bab - 1) / 5) + 1, 1); // One attack at BAB +0, and an additional attack for every 5 BAB
        console.log(`Base Attack Bonus: ${bab}, Primary Attacks: ${iterations}`);
        const offhand = this.owner.inventory.getWeaponInSlot(EquipmentSlot.OFFHAND);
        console.log(`Off-hand weapon: ${offhand ? offhand.getId() : "None"}`);
        if (offhand) {
            const maxOffhandIterations = modifierManager.getTotalModifier(AttackIteration.OFFHAND, this.owner, {});
            attackCount[AttackIteration.OFFHAND] = maxOffhandIterations + 1;
        }
        const primaryFullIterations = modifierManager.getTotalModifier(AttackIteration.PRIMARY_FULL, this.owner, {});
        attackCount[AttackIteration.PRIMARY_FULL] = primaryFullIterations;
        attackCount[AttackIteration.PRIMARY] = iterations;
        return attackCount;
    }
    getNumberOfAttacks() {
        const iterations = this.getAttackIterations();
        return iterations[AttackIteration.PRIMARY] + iterations[AttackIteration.OFFHAND] + iterations[AttackIteration.PRIMARY_FULL];
    }
    getInitiative() {
        return this.initiative;
    }
    getInitiativeBonus() {
        let base = this.owner.stats.getAbilityScoreModifiers().dexterity;
        const bonuses = modifierManager.getTotalModifier("initiative", this.owner, {});
        return base + bonuses;
    }
    rollInitiative() {
        const roll = DiceRoller.roll(Dice.d20)[0];
        const initiative = roll + this.getInitiativeBonus();
        this.initiative = initiative;
        const { x, y } = this.owner.getScreenPosition();
        const { x: visualOffsetX, y: visualOffsetY } = this.owner.getVisualOffset();
        effectManager.addEffect(new CustomFloatingText(`${initiative}`, x + visualOffsetX, y + visualOffsetY, 32, "yellow", 3000, 75));
        return initiative;
    }
    hasRolledInitiative() {
        return this.initiative !== -Infinity; // Initiative is set to -Infinity by default, so if it's different, it means initiative has been rolled
    }
    resetInitiative() {
        this.initiative = -Infinity; // Reset initiative to default state
    }
    applyMovementCost(cost) {
        this.movement -= cost;
        if (this.owner.getMoveSpeed() - this.movement > 1 && this.actions[Action.MOVE] > 0) {
            this.spendAction(Action.MOVE); // If the creature has moved more than 1 cell, it has used its move action for the turn
        }
        if (this.movement < 0 && this.actions[Action.STANDARD] > 0) {
            this.movement += this.owner.getMoveSpeed();
            this.spendAction(Action.STANDARD); // The creature must dash if it tries to move beyond its movement speed, which means it cannot take a standard action after moving its full movement
        }
        combatEvents.emit(CombatEventId.STAT_CHANGED, { creatureUID: this.owner.getUID() }); // Emit stat changed event to update UI
    }
    resetActions() {
        this.actions = {
            [Action.STANDARD]: 1,
            [Action.MOVE]: 1,
            [Action.FULL_ROUND]: 1,
            [Action.SWIFT]: 1,
        };
        this.movement = this.owner.getMoveSpeed();
        combatEvents.emit(CombatEventId.STAT_CHANGED, { creatureUID: this.owner.getUID() }); // Emit stat changed event to update UI
        this.turnEnd = false; // Reset turn end status at the start of the turn
    }
    spendAction(actionType) {
        if (this.actions[actionType] > 0) {
            this.actions[actionType]--;
            if (actionType === Action.FULL_ROUND) {
                this.actions[Action.STANDARD] = 0;
                this.actions[Action.MOVE] = 0;
                this.movement = Math.min(this.movement, 1); // If a full-round action is taken, movement is set to 1 and move action is lost
            }
            else if (actionType !== Action.SWIFT) {
                this.actions[Action.FULL_ROUND] = 0;
            }
            combatEvents.emit(CombatEventId.STAT_CHANGED, { creatureUID: this.owner.getUID() }); // Emit stat changed event to update UI
        }
    }
    async attack(target, tile) {
        if (this.actions[Action.FULL_ROUND] > 0) {
            this.spendAction(Action.FULL_ROUND);
            const attackIterations = this.getAttackIterations();
            for (let i = 0; i < attackIterations[AttackIteration.PRIMARY]; i++) {
                if (!target)
                    break;
                const ctx = this.owner.inventory.getEquippedWeapons()[0]; // Assuming the first equipped weapon is the primary weapon, this can be improved by checking which weapon is actually being used for the attack
                await this.owner.playMeleeAttackAnimation(target, tile, ctx);
                if (!this.checkIfAttackTargetValid(target)) {
                    target = this.findNearestHostileWithinRange(this.getAttackRange(ctx.weapon) || 1); // If the original target is no longer valid (e.g. killed by a previous attack), find a new target within range
                    tile = { x: target.x, y: target.y }; // Update the target tile to the new target's position
                }
            }
            for (let i = 0; i < attackIterations[AttackIteration.PRIMARY_FULL]; i++) {
                if (!target)
                    break;
                const ctx = this.owner.inventory.getEquippedWeapons()[0]; // Assuming the first equipped weapon is the primary weapon, this can be improved by checking which weapon is actually being used for the attack
                await this.owner.playMeleeAttackAnimation(target, tile, ctx);
                if (!this.checkIfAttackTargetValid(target)) {
                    target = this.findNearestHostileWithinRange(this.getAttackRange(ctx.weapon) || 1); // If the original target is no longer valid (e.g. killed by a previous attack), find a new target within range
                    tile = { x: target.x, y: target.y }; // Update the target tile to the new target's position
                }
            }
            for (let i = 0; i < attackIterations[AttackIteration.OFFHAND]; i++) {
                if (!target)
                    break;
                const ctx = this.owner.inventory.getEquippedWeapons()[1]; // Assuming the second equipped weapon is the off-hand weapon, this can be improved by checking which weapon is actually being used for the attack
                await this.owner.playMeleeAttackAnimation(target, tile, ctx);
                if (!this.checkIfAttackTargetValid(target)) {
                    target = this.findNearestHostileWithinRange(this.getAttackRange(ctx.weapon) || 1); // If the original target is no longer valid (e.g. killed by a previous attack), find a new target within range
                    tile = { x: target.x, y: target.y }; // Update the target tile to the new target's position
                }
            }
        }
        else if (this.actions[Action.STANDARD] > 0) {
            this.spendAction(Action.STANDARD);
            const ctx = this.owner.inventory.getEquippedWeapons()[0]; // Assuming the first equipped weapon is the primary weapon, this can be improved by checking which weapon is actually being used for the attack
            await this.owner.playMeleeAttackAnimation(target, tile, ctx);
        }
    }
    checkIfAttackTargetValid(target) {
        return target !== null && target !== undefined && target.stats.isAlive();
    }
    findNearestHostileWithinRange(range) {
        const hostiles = entityManager.getCreaturesByFaction(this.owner.stats.getFaction() === Faction.PLAYER ? Faction.HOSTILE : Faction.PLAYER, { map: this.owner.getMap() });
        if (hostiles.length === 0) {
            return null; // No hostiles to target
        }
        let nearestHostile = null;
        let nearestDistance = Infinity;
        for (const hostile of hostiles) {
            if (!hostile.stats.isAlive())
                continue; // Skip dead hostiles
            const dist = pathfinder.heuristic({ x: this.owner.x, y: this.owner.y }, { x: hostile.x, y: hostile.y });
            if (dist < nearestDistance && dist <= range) {
                nearestDistance = dist;
                nearestHostile = hostile;
            }
        }
        return nearestHostile;
    }
    executeAttack(target, ctx) {
        const attackResult = this.buildAttack(ctx);
        const attackRollResult = DiceRoller.attackRoll(this.owner, target, attackResult);
        console.log(`Attack made! Roll: ${attackRollResult.attackRoll}, Total: ${attackRollResult.totalRoll}, Target AC: ${target.stats.getAC().full}`);
        if (attackRollResult.isHit) {
            const damage = DiceRoller.rollBetween(attackResult.damageMin, attackResult.damageMax);
            console.log(`Attack hits! Dealing ${damage} ${attackResult.damageType} damage.`);
            target.takeDamage(damage);
            effectManager.addEffect(new CustomFloatingText(`Hit! -${damage}`, target.screenX, target.screenY, 24, "red", 1500, 50));
        }
        else {
            effectManager.addEffect(new CustomFloatingText("Miss!", target.screenX, target.screenY, 24, "gold", 1500, 50));
            return;
        }
    }
}
//# sourceMappingURL=creature_combat.js.map