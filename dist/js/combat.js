Math.clamp = function(value, min, max) {
	return Math.min(Math.max(min, value), max);
};

const WEAPON_TABLE = {
	avalanche: { hitChance: 40, dmg: 340, penetration: 0, shotDelay: 2000 },
	stingray: { hitChance: 40, dmg: 200, penetration: 10, shotDelay: 1500 },
	sparrowhawks: { hitChance: 40, dmg: 100, penetration: 10, shotDelay: 1500 },
	phoenix: { hitChance: 40, dmg: 140, penetration: 5, shotDelay: 750 },
	coilgun: { hitChance: 40, dmg: 230, penetration: 18, shotDelay: 750 },
	laser: { hitChance: 55, dmg: 290, penetration: 5, shotDelay: 1000 },
	pulse: { hitChance: 55, dmg: 300, penetration: 11, shotDelay: 750 },
	plasma: { hitChance: 40, dmg: 650, penetration: 22, shotDelay: 1000 },
	emp: { hitChance: 30, dmg: 310, penetration: 30, shotDelay: 550 },
	xcomFusion: { hitChance: 30, dmg: 1200, penetration: 26, shotDelay: 1250 },
	singlePlasma: { hitChance: 33, dmg: 450, penetration: 0, shotDelay: 1150 },
	doublePlasma: { hitChance: 40, dmg: 800, penetration: 20, shotDelay: 1250 },
	ufoFusion: { hitChance: 45, dmg: 1300, penetration: 50, shotDelay: 1250 },
};

const UFO_TABLE = {
	scout: {
		health: 750,
		armor: 0,
		bonusPen: 3,
		weapon: "singlePlasma",
		secondary: null,
		speed: 42,
		destruction: 0.002,
	},
	fighter: {
		health: 850,
		armor: 12,
		bonusPen: 7,
		weapon: "singlePlasma",
		secondary: null,
		speed: 40,
		destruction: 0.002,
	},
	raider: {
		health: 1500,
		armor: 5,
		bonusPen: 7,
		weapon: "singlePlasma",
		secondary: null,
		speed: 32,
		destruction: 0.00167,
	},
	destroyer: {
		health: 1600,
		armor: 18,
		bonusPen: 15,
		weapon: "singlePlasma",
		secondary: null,
		speed: 30,
		destruction: 0.00167,
	},
	harvester: {
		health: 6000,
		armor: 20,
		bonusPen: 3,
		weapon: "doublePlasma",
		secondary: null,
		speed: 12,
		destruction: 0.00143,
	},
	abductor: {
		health: 4000,
		armor: 30,
		bonusPen: 2,
		weapon: "doublePlasma",
		secondary: null,
		speed: 20,
		destruction: 0.00143,
	},
	transport: {
		health: 5000,
		armor: 32,
		bonusPen: 0,
		weapon: "doublePlasma",
		secondary: null,
		speed: 12,
		destruction: 0.00125,
	},
	terror: {
		health: 6000,
		armor: 25,
		bonusPen: 0,
		weapon: "doublePlasma",
		secondary: null,
		speed: 14,
		destruction: 0.00125,
	},
	battleship: {
		health: 9000,
		armor: 36,
		bonusPen: 25,
		weapon: "ufoFusion",
		secondary: null,
		speed: 20,
		destruction: 0.00067,
	},
	assault: {
		health: 8000,
		armor: 28,
		bonusPen: 18,
		weapon: "doublePlasma",
		secondary: "singlePlasma",
		speed: 22,
		destruction: 0.00067,
	},
	overseer: {
		health: 2500,
		armor: 40,
		bonusPen: 25,
		weapon: "doublePlasma",
		secondary: "singlePlasma",
		speed: 60,
		destruction: 0,
	},
};

const RESEARCH_BONUSES = { health: 75, dmg: 8, aim: 2 },
	PILOT_BONUSES = { aim: 3, dmg: 0.01 },
	STANCE_BONUSES = { aggressive: 15, balanced: 0, defensive: -15 },
	AIM_MODULE_USES = 2,
	DODGE_MODULE_USES = 2;

// Constructors
function Interceptor(
	type,
	kills,
	weapon,
	stance,
	deathAbort,
	killAbort,
	aim,
	dodge
) {
	this.type = type;
	this.pilotKills = kills;
	this.weapon = weapon;
	this.secondary = sparrowhawks ? "sparrowhawks" : null;
	this.stance = stance;
	this.deathAbortPercent = deathAbort / 100;
	this.killAbortPercent = killAbort / 100;
	this.aimModule = aim ? AIM_MODULE_USES : 0;
	this.dodgeModule = dodge ? DODGE_MODULE_USES : 0;
	// health calc
	this.health = this.type == "firestorm" ? 4000 : 2500;
	if (armoredFighters) {
		this.health += 1000;
	}
	// armor
	this.armor = this.type == "firestorm" ? 25 : 5;

	// weapon bonuses
	this.aimBonus = Math.min(this.pilotKills * PILOT_BONUSES.aim, 30);
	if (avionics) {
		this.aimBonus += 10;
	}

	this.penetrationBonus = 0;
	if (this.type == "firestorm") {
		this.penetrationBonus += 5;
	}
	if (penWeapons) {
		this.penetrationBonus += 5;
	}

	this.bonusDmg = 1 + this.pilotKills * PILOT_BONUSES.dmg;

	// primary weapon stats
	this.hitChance = WEAPON_TABLE[this.weapon].hitChance + this.aimBonus;

	this.shotDelay = WEAPON_TABLE[this.weapon].shotDelay;

	this.penetration =
		WEAPON_TABLE[this.weapon].penetration + this.penetrationBonus;

	this.baseDmg = WEAPON_TABLE[this.weapon].dmg * this.bonusDmg;

	// secondary weapon stats
	if (this.secondary) {
		this.secondaryHitChance =
			WEAPON_TABLE[this.secondary].hitChance + this.aimBonus;

		this.secondaryShotDelay = WEAPON_TABLE[this.secondary].shotDelay;

		this.secondaryPenetration =
			WEAPON_TABLE[this.secondary].penetration + this.penetrationBonus;

		this.secondaryDmg = WEAPON_TABLE[this.secondary].dmg * this.bonusDmg;
	}

	this.speed = this.type == "firestorm" ? 15 : 10;
}

function Ufo(type, research, startHealth, altitude, alwaysHit) {
	this.type = type;
	this.researchUpgrade = Math.floor(research / 30);
	this.startingHealth = startHealth / 100;
	this.altitude = altitude;
	this.alwaysGetsHit = alwaysHit;
	// Derived properties
	// UFO weapons
	this.weapon =
		this.type == "destroyer" && this.researchUpgrade >= 9
			? "doublePlasma"
			: UFO_TABLE[this.type].weapon;

	this.secondary =
		this.type == "fighter" && this.researchUpgrade >= 11
			? "singlePlasma"
			: this.type == "raider" && this.researchUpgrade >= 19
			? "singlePlasma"
			: this.type == "abductor" && this.researchUpgrade >= 13
			? "singlePlasma"
			: this.type == "terror" && this.researchUpgrade >= 13
			? "singlePlasma"
			: UFO_TABLE[this.type].secondary;
	// health calc
	this.health =
		(UFO_TABLE[this.type].health +
			this.researchUpgrade * RESEARCH_BONUSES.health) *
		this.startingHealth;
	// armor
	this.armor =
		this.type == "destroyer" && this.researchUpgrade >= 18
			? 32
			: UFO_TABLE[this.type].armor;

	// weapon bonuses
	this.aimBonus = this.researchUpgrade * RESEARCH_BONUSES.aim;
	if (countermeasures) {
		this.aimBonus -= 15;
	}

	this.penetrationBonus = UFO_TABLE[this.type].bonusPen;
	if (this.type == "destroyer" && this.researchUpgrade >= 18) {
		this.penetrationBonus += 5;
	}

	this.bonusDmg = this.researchUpgrade * RESEARCH_BONUSES.dmg;

	// primary weapon stats
	this.hitChance = WEAPON_TABLE[this.weapon].hitChance + this.aimBonus;

	this.shotDelay = WEAPON_TABLE[this.weapon].shotDelay;

	this.penetration =
		WEAPON_TABLE[this.weapon].penetration + this.penetrationBonus;

	this.baseDmg = WEAPON_TABLE[this.weapon].dmg + this.bonusDmg;

	// secondary weapon stats
	if (this.secondary) {
		this.secondaryHitChance =
			WEAPON_TABLE[this.secondary].hitChance + this.aimBonus;

		this.secondaryShotDelay = WEAPON_TABLE[this.secondary].shotDelay;

		this.secondaryPenetration =
			WEAPON_TABLE[this.secondary].penetration + this.penetrationBonus;

		this.secondaryDmg = WEAPON_TABLE[this.secondary].dmg + this.bonusDmg;
	}

	// ufo speed
	this.speed = UFO_TABLE[this.type].speed;

	this.destruction = UFO_TABLE[this.type].destruction;
}
// Objects
let interceptor1 = new Interceptor(...buildInterceptor()[0]);

console.log(interceptor1);
console.log("INTERCEPTOR BASE STATS");
console.log("xcom type: " + interceptor1.type);
console.log("interceptor 1 health: " + interceptor1.health);
console.log("interceptor 1 armor: " + interceptor1.armor);
console.log("interceptor 1 weapon: " + interceptor1.weapon);
console.log("interceptor 1 secondary: " + interceptor1.secondary);
console.log("interceptor 1 aimBonus: " + interceptor1.aimBonus);
console.log("interceptor 1 primary hitChance: " + interceptor1.hitChance);
console.log(
	"interceptor 1 secondary hit chance: " + interceptor1.secondaryHitChance
);
console.log("interceptor 1 shotDelay: " + interceptor1.shotDelay);
console.log(
	"interceptor 1 secondary shotDelay: " + interceptor1.secondaryShotDelay
);
console.log("interceptor 1 penetration: " + interceptor1.penetration);
console.log(
	"interceptor 1 secondary penetration: " + interceptor1.secondaryPenetration
);
console.log("interceptor 1 damage bonus: " + interceptor1.bonusDmg);
console.log("interceptor 1 primary damage: " + interceptor1.baseDmg);
console.log("interceptor 1 secondary damage: " + interceptor1.secondaryDmg);
console.log("interceptor 1 speed: " + interceptor1.speed);
console.log("death abort %: " + interceptor1.deathAbortPercent);
console.log("kill abort %: " + interceptor1.killAbortPercent);
console.log("aim module uses: " + interceptor1.aimModule);
console.log("dodge module uses: " + interceptor1.dodgeModule);

let ufo = new Ufo("fighter", 330, 100, "low", false);

console.log("UFO BASE STATS");
console.log("ufo type: " + ufo.type);
console.log("ufo health: " + ufo.health);
console.log("ufo armor: " + ufo.armor);
console.log("ufo weapon: " + ufo.weapon);
console.log("ufo secondary: " + ufo.secondary);
console.log("ufo aim bonus: " + ufo.aimBonus);
console.log("ufo hitChance: " + ufo.hitChance);
console.log("ufo secondary hitChance: " + ufo.secondaryHitChance);
console.log("ufo shotDelay: " + ufo.shotDelay);
console.log("ufo secondaryShotDelay: " + ufo.secondaryShotDelay);
console.log("ufo bonus penetration: " + ufo.penetrationBonus);
console.log("ufo penetration: " + ufo.penetration);
console.log("ufo secondary penetration: " + ufo.secondaryPenetration);
console.log("ufo bonus damage: " + ufo.bonusDmg);
console.log("ufo primary damage: " + ufo.baseDmg);
console.log("ufo secondary damage: " + ufo.secondaryDmg);
console.log("ufo speed: " + ufo.speed);
console.log("ufo researchUpgrade: " + ufo.researchUpgrade);

function AirCombat(interceptor, ufo) {
	this.interceptionTime = afterburners
		? 5000 + Math.floor(30000 * (interceptor.speed / ufo.speed))
		: Math.floor(30000 * (interceptor.speed / ufo.speed));
	this.xcomHitChance =
		interceptor.hitChance + STANCE_BONUSES[interceptor.stance];
	this.xcomCritChance = Math.clamp(
		(interceptor.penetration - ufo.armor) / 2,
		5,
		25
	);

	if (interceptor.secondary) {
		this.xcomSecondaryHitChance =
			interceptor.hitChance + STANCE_BONUSES[interceptor.stance];

		this.xcomSecondaryCritChance = Math.clamp(
			(interceptor.secondaryPenetration - ufo.armor) / 2,
			5,
			25
		);
	}
	this.deathAbortHealth = interceptor.health * interceptor.deathAbortPercent;
	this.xcomAimModule = interceptor.aimModule;
	this.xcomDodgeModule = interceptor.dodgeModule;
	this.ufoHitChance = ufo.hitChance + STANCE_BONUSES[interceptor.stance];
	this.ufoCritChance = Math.clamp(
		(ufo.penetration - interceptor.armor) / 2,
		5,
		25
	);

	if (ufo.secondary) {
		this.ufoSecondaryHitChance =
			ufo.secondaryHitChance + STANCE_BONUSES[interceptor.stance];

		this.ufoSecondaryCritChance = Math.clamp(
			(ufo.secondaryPenetration - interceptor.armor) / 2,
			5,
			25
		);
	}

	this.killAbortHealth = ufo.health * interceptor.killAbortPercent;

	this.ufoDestroyed = function(health) {
		return -health * ufo.destruction;
	};
	// old effective damage calcs
	// this.xcomEffDmg = function() {
	// 	base = interceptor.baseDmg * interceptor.bonusDmg;
	// 	return (
	// 		base *
	// 		(1 - this.armorMitigation(ufo.armor, interceptor.penetration))
	// 	).toFixed(1);
	// };
	// this.ufoEffDmg = function() {
	// 	base = ufo.baseDmg + ufo.bonusDmg;
	// 	return (
	// 		base *
	// 		(1 - this.armorMitigation(interceptor.armor, ufo.penetration))
	// 	).toFixed(1);
	// };

	this.armorMitigation = function(armor, penetration) {
		return Math.clamp(0.05 * (armor - penetration), 0, 0.95);
	};

	this.effDmg = function(base, armor, penetration) {
		return (base * (1 - this.armorMitigation(armor, penetration))).toFixed(1);
	};
	this.xcomShoots = function(hitChance, effDmg, critChance, aim) {
		if (this.shotChance() <= hitChance) {
			console.log("hit");
			return this.rollDmg(effDmg, critChance);
		} else {
			console.log("miss");
			if (aim > 0) {
				this.xcomAimModule--;
				console.log("aim module used. Uses left: " + this.xcomAimModule);
				return this.rollDmg(effDmg, critChance);
			}
			return 0;
		}
	};
	this.ufoShoots = function(hitChance, effDmg, critChance, dodge) {
		if (this.shotChance() <= hitChance) {
			console.log("hit");
			if (dodge > 0) {
				this.xcomDodgeModule--;
				console.log("dodge module used. Uses left: " + this.xcomDodgeModule);
				return 0;
			}
			return this.rollDmg(effDmg, critChance);
		} else {
			console.log("miss");
			return 0;
		}
	};
	this.rollDmg = function(effDmg, critChance) {
		base = effDmg;
		roll = (Math.random() * 100 + 1).toFixed(1);
		if (roll <= critChance) {
			console.log("CRIT!");
			base *= 2;
		}
		console.log("crit roll: " + roll);
		let shotDmg = Math.round(base * (Math.random() * 0.5 + 1));
		console.log("shot dmg " + shotDmg);
		return shotDmg;
	};
	this.shotChance = function() {
		roll = Math.floor(Math.random() * 100 + 1);
		console.log(roll);
		return roll;
	};
}

let interception1 = new AirCombat(interceptor1, ufo);

console.log("AIR COMBAT STATS");
console.log("interception time: " + interception1.interceptionTime);
console.log("xcom stance: " + interceptor1.stance);
console.log("xcom hit chance " + interception1.xcomHitChance);
console.log("xcom crit chance: " + interception1.xcomCritChance);
console.log("xcom aim module uses: " + interception1.xcomAimModule);
console.log("xcom dodge module uses: " + interception1.xcomDodgeModule);
console.log(
	"xcom primary eff dmg: " +
		interception1.effDmg(
			interceptor1.baseDmg,
			ufo.armor,
			interceptor1.penetration
		)
);
console.log(
	"xcom secondary eff dmg: " +
		interception1.effDmg(
			interceptor1.secondaryDmg,
			ufo.armor,
			interceptor1.secondaryPenetration
		)
);
console.log("ufo hit chance: " + interception1.ufoHitChance);
console.log("ufo crit chance: " + interception1.ufoCritChance);
console.log(
	"ufo primary eff dmg: " +
		interception1.effDmg(ufo.baseDmg, interceptor1.armor, ufo.penetration)
);
console.log(
	"ufo secondary eff dmg: " +
		interception1.effDmg(
			ufo.secondaryDmg,
			interceptor1.armor,
			ufo.secondaryPenetration
		)
);

// Air combat results
let kill = { number: 0, destroyed: 0, xcomHealth: 0 },
	killAbort = { number: 0, ufoHealth: 0, xcomHealth: 0 },
	stalemate = { number: 0, ufoHealth: 0, xcomHealth: 0 },
	deathAbort = { number: 0, ufoHealth: 0, xcomTimer: 0 },
	death = { number: 0, ufoHealth: 0, ufoTimer: 0 };

// Functions to update air combat results objects
function updateKill() {
	kill.number += 1;
	kill.xcomHealth += interceptor1.health;
	kill.destroyed += Math.clamp(
		interception1.ufoDestroyed(ufo.health),
		0,
		100
	).toFixed(3);
}
function updateKillAbort() {
	killAbort.number += 1;
	killAbort.ufoHealth += ufo.health;
	killAbort.xcomHealth += interceptor1.health;
}
function updateStalemate() {
	stalemate.number += 1;
	stalemate.ufoHealth += ufo.health;
	stalemate.xcomHealth += interceptor1.health;
}
function updateDeathAbort() {
	deathAbort.number += 1;
	deathAbort.ufoHealth += ufo.health;
	deathAbort.xcomTimer += timerTwo;
}
function updateDeath() {
	death.number += 1;
	death.ufoHealth += ufo.health;
	death.ufoTimer += timerTwo;
}

// Air combat simulation
timerOne = Math.floor(Math.random() * 2000);
timerTwo = Math.floor(Math.random() * 2000);
timerThree = interceptor1.secondary ? Math.floor(Math.random() * 2000) : 0;
timerFour = ufo.secondary ? Math.floor(Math.random() * 2000) : 0;

let timers = { timerOne, timerTwo, timerThree, timerFour };
let sortable = [];
for (timer in timers) {
	sortable.push([timer, timers[timer]]);
}
// timerOne = 500;
// timerTwo = 1500;

// attempt 2 - label statements
// xcomShoot:
//     while (timerOne < airCombat.interceptionTime) {
//         console.log("ufo health " + (ufo.health -= airCombat.shoot(interceptor.hitChance, interceptor.effDmg)));
//         timerOne += interceptor.shotDelay;
//     };

// ufoShoot:
//     while (timerTwo < airCombat.interceptionTime) {
//         console.log("xcom health " + (interceptor.health -= airCombat.shoot(ufo.hitChance, ufo.effDmg)));
//         timerTwo += ufo.shotDelay;
//     }
console.log("AIR COMBAT ROLLS");
console.log("timer One : " + timerOne);
console.log("timer Two : " + timerTwo);
console.log("timer Three : " + timerThree);
console.log("timer Four : " + timerFour);
console.log(timers);
let sorted = sortable.sort((a, b) => a[1] - b[1]);
console.log(sorted);

engagement: {
	
	let sortedTimers = [];
	for (timer in timers) {
		sortedTimers.push([timer, timers[timer]]);
	}
	sortedTimers = sortedTimers.sort((a, b) => a[1] - b[1]);
	console.log(sortedTimers);
	while (sortedTimers.some(checkTimer)) {
		if (sorted[0][0] == "timerOne") {
			console.log("xcom primary timer: " + timerOne);
			console.log("XCOM shoots primary");
			console.log(
				"ufo health " +
					(ufo.health -= interception1.xcomShoots(
						interception1.xcomHitChance,
						interception1.effDmg(
							interceptor1.baseDmg,
							ufo.armor,
							interceptor1.penetration
						),
						interception1.xcomCritChance,
						interception1.xcomAimModule
					))
			);
			if (ufo.health <= interception1.killAbortHealth && ufo.health > 0) {
				updateKillAbort();
				break engagement;
			} else if (ufo.health < 0) {
				updateKill();
				break engagement;
			}
			(sortedTimers[0][1] += interceptor1.shotDelay);
			
		} else if (sorted[0][0] == "timerTwo") {
			console.log("ufo primary timer: " + timerTwo);
			console.log("UFO shoots");
			console.log(
				"xcom health " +
					(interceptor1.health -= interception1.ufoShoots(
						interception1.ufoHitChance,
						interception1.effDmg(
							ufo.baseDmg,
							interceptor1.armor,
							ufo.penetration
						),
						interception1.ufoCritChance,
						interception1.xcomDodgeModule
					))
			);
			if (
				interceptor1.health <= interception1.deathAbortHealth &&
				interceptor1.health > 0
			) {
				updateDeathAbort();
				break engagement;
			} else if (interceptor1.health < 0) {
				updateDeath();
				break engagement;
			}
			 (timers.timerTwo += ufo.shotDelay);
		} else if (sorted[0][0] == "timerThree") {
			console.log("xcom secondary timer: " + timerThree);
			console.log("XCOM shoots secondary");
			console.log(
				"ufo health " +
					(ufo.health -= interception1.xcomShoots(
						interception1.xcomSecondaryHitChance,
						interception1.effDmg(
							interceptor1.secondaryDmg,
							ufo.armor,
							interceptor1.secondaryPenetration
						),
						interception1.xcomSecondaryCritChance
					))
			);
			if (ufo.health <= interception1.killAbortHealth && ufo.health > 0) {
				updateKillAbort();
				break engagement;
			} else if (ufo.health < 0) {
				updateKill();
				break engagement;
			}
			 (timers.timerThree += interceptor1.secondaryShotDelay);
		} else if (sorted[0][0] == "timerFour") {
			console.log("ufo secondary timer: " + timerFour);
			console.log("UFO shoots");
			console.log(
				"xcom health " +
					(interceptor1.health -= interception1.ufoShoots(
						interception1.ufoSecondaryHitChance,
						interception1.effDmg(
							ufo.secondaryDmg,
							interceptor1.armor,
							ufo.secondaryPenetration
						),
						interception1.secondaryUfoCritChance,
						interception1.xcomDodgeModule
					))
			);
			if (
				interceptor1.health <= interception1.deathAbortHealth &&
				interceptor1.health > 0
			) {
				updateDeathAbort();
				break engagement;
			} else if (interceptor1.health < 0) {
				updateDeath();
				break engagement;
			}
			 (timers.timerFour += ufo.secondaryShotDelay);
		}
	} 
}
function checkTimer(timer) {
	return timer[1] < interception1.interceptionTime;
}

// working engagment with two timers
// engagement: while ((timerOne && timerTwo) < interception1.interceptionTime) {
// 	if (timerOne < timerTwo) {
// 		while (timerOne < timerTwo) {
// 			console.log("xcom timer: " + timerOne + " ufo timer: " + timerTwo);
// 			console.log("XCOM shoots");
// 			console.log(
// 				"ufo health " +
// 					(ufo.health -= interception1.xcomShoots(
// 						interception1.xcomHitChance,
// 						interception1.effDmg(interceptor1.baseDmg, ufo.armor,interceptor1.penetration),
// 						interception1.xcomCritChance,
// 						interception1.xcomAimModule
// 					))
// 			);
// 			if (ufo.health <= interception1.killAbortHealth && ufo.health > 0) {
// 				updateKillAbort();
// 				break engagement;
// 			} else if (ufo.health < 0) {
// 				updateKill();
// 				break engagement;
// 			}
// 			timerOne += interceptor1.shotDelay;
// 		}
// 	} else {
// 		while (timerOne >= timerTwo) {
// 			console.log("xcom timer: " + timerOne + " ufo timer: " + timerTwo);
// 			console.log("UFO shoots");
// 			console.log(
// 				"xcom health " +
// 					(interceptor1.health -= interception1.ufoShoots(
// 						interception1.ufoHitChance,
// 						interception1.effDmg(ufo.baseDmg, interceptor1.armor, ufo.penetration),
// 						interception1.ufoCritChance,
// 						interception1.xcomDodgeModule
// 					))
// 			);
// 			if (
// 				interceptor1.health <= interception1.deathAbortHealth &&
// 				interceptor1.health > 0
// 			) {
// 				updateDeathAbort();
// 				break engagement;
// 			} else if (interceptor1.health < 0) {
// 				updateDeath();
// 				break engagement;
// 			}
// 			timerTwo += ufo.shotDelay;
// 		}
// 	}
// 	if ((timerOne && timerTwo) > interception1.interceptionTime) {
// 		updateStalemate();
// 	}
// }

console.log("INTERCEPTION RESULTS");
console.log(
	"kill % : " + kill.number + " " + kill.destroyed + " " + kill.xcomHealth
);
console.log(
	"killAbort % : " +
		killAbort.number +
		" " +
		killAbort.ufoHealth +
		" " +
		killAbort.xcomHealth
);
console.log(
	"stalemate % : " +
		stalemate.number +
		" " +
		stalemate.ufoHealth +
		" " +
		stalemate.xcomHealth
);
console.log(
	"deathAbort % : " +
		deathAbort.number +
		" " +
		deathAbort.ufoHealth +
		" " +
		deathAbort.xcomTimer
);
console.log(
	"death % : " + death.number + " " + death.ufoHealth + " " + death.ufoTimer
);

// // attempt 1 - pure while loop
// while (((timerOne && timerTwo) < airCombat.interceptionTime) && (ufo.health || interceptor.health) > 0)  {
//   console.log("xcom timer " + timerOne);
//   console.log("ufo timer " + timerTwo);
//   if (timerOne < timerTwo) {
//     console.log(
//       "ufo health " +
//         (ufo.health -= airCombat.shoot(
//           interceptor.hitChance,
//           interceptor.effDmg
//         ))
//     );
//     timerOne += interceptor.shotDelay;
//     console.log(
//       "xcom health " +
//         (interceptor.health -= airCombat.shoot(ufo.hitChance, ufo.effDmg))
//     );
//     timerTwo += ufo.shotDelay;
//   } else {
//     console.log(
//       "xcom health " +
//         (interceptor.health -= airCombat.shoot(ufo.hitChance, ufo.effDmg))
//     );
//     timerTwo += ufo.shotDelay;
//     console.log(
//       "ufo.health " +
//         (ufo.health -= airCombat.shoot(
//           interceptor.hitChance,
//           interceptor.effDmg
//         ))
//     );
//     timerOne += interceptor.shotDelay;
//   }
// }
