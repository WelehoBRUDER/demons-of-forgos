enum WeaponType {
	MELEE = "melee",
	RANGED = "ranged",
}

interface WeaponData extends EquipmentData {
	damage: DamageDieInfo;
	weaponType: WeaponType;
	critRange?: number; // Minimum number on a d20 roll to score a critical hit (e.g., 19 means 19-20 is a crit)
	critMultiplier?: number; // Damage multiplier for critical hits (e.g., 2 means double damage on a crit)
	finesse?: boolean;
	light?: boolean;
	heavy?: boolean;
	anchorPoint?: AnchorPointType; // Optional, defaults to "weapon" if not provided
}

enum DamageDiceProgression {
	"1d2",
	"1d3",
	"1d4",
	"1d6",
	"1d8",
	"1d10",
	"2d6",
	"2d8",
	"3d6",
	"3d8",
	"4d6",
	"4d8",
	"6d6",
	"6d8",
	"8d6",
	"8d8",
	"12d6",
	"12d8",
	"16d6",
}

interface DamageDieInfo {
	count: number;
	type: Dice;
}

class DamageProgression {
	static getNextDamage(damage: DamageDieInfo): DamageDieInfo {
		const key = DamageProgression.damageObjectToKey(damage);
		const progression = Object.values(DamageDiceProgression);
		const index = progression.indexOf(key);
		if (index >= 0 && index < progression.length - 1) {
			// @ts-ignore
			return DamageProgression.damageKeyToObject(progression[index + 1]);
		} else {
			throw new Error(`Damage ${key} is not in the progression or is already at max`);
		}
	}

	static getPreviousDamage(damage: DamageDieInfo): DamageDieInfo {
		const key = DamageProgression.damageObjectToKey(damage);
		const progression = Object.values(DamageDiceProgression);
		const index = progression.indexOf(key);
		if (index > 0) {
			// @ts-ignore
			return DamageProgression.damageKeyToObject(progression[index - 1]);
		} else {
			throw new Error(`Damage ${key} is not in the progression or is already at minimum`);
		}
	}

	static standardizeDice(damage: DamageDieInfo): DamageDieInfo {
		if (damage.type === Dice.d4) {
			if (damage.count % 2 === 0) {
				return { count: damage.count / 2, type: Dice.d8 };
			} else {
				return { count: Math.floor(damage.count * (2 / 3)), type: Dice.d6 };
			}
		}
		if (damage.type === Dice.d12) {
			return { count: damage.count * 2, type: Dice.d6 };
		}
	}

	static damageObjectToKey(damage: DamageDieInfo): string {
		return `${damage.count}d${damage.type}`;
	}

	static damageKeyToObject(key: string): DamageDieInfo {
		const match = key.match(/(\d+)d(\d+)/);
		if (match) {
			return { count: parseInt(match[1]), type: parseInt(match[2]) as Dice };
		} else {
			throw new Error(`Invalid damage key: ${key}`);
		}
	}
}

class Weapon extends Equipment {
	damage: DamageDieInfo;
	weaponType: WeaponType;
	critRange: number;
	critMultiplier: number;
	finesse: boolean;
	light: boolean;
	heavy: boolean;
	constructor(data: WeaponData) {
		super(data);
		this.type = "Weapon";
		this.anchorPoint = data.anchorPoint || AnchorPointType.weapon; // Default to "weapon" anchor point if not specified
		this.damage = data.damage;
		this.weaponType = data.weaponType;
		this.critRange = data.critRange || 20; // Default critical hit range is 20 (only a natural 20 is a crit)
		this.critMultiplier = data.critMultiplier || 2; // Default critical hit damage multiplier is 2 (double damage)
		this.finesse = data.finesse || false;
		this.light = data.light || false;
		this.heavy = data.heavy || false;
	}

	getDamage(): DamageDieInfo {
		return this.damage;
	}

	isFinesse(): boolean {
		return this.finesse;
	}

	isLight(): boolean {
		return this.light;
	}

	isHeavy(): boolean {
		return this.heavy;
	}

	getModifiers(ctx: any): Modifier[] {
		return [];
	}
}
