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
	ufoFusion: { hitChance: 45, dmg: 1300, penetration: 50, shotDelay: 1250 }
};

const UFO_TABLE = {
	scout: {
		health: 750,
		armor: 0,
		bonusPen: 3,
		weapon: "singlePlasma",
		secondary: null,
		speed: 42,
		destruction: 0.2,
	},
	fighter: {
		health: 850,
		armor: 12,
		bonusPen: 7,
		weapon: "singlePlasma",
		secondary: null,
		speed: 40,
		destruction: 0.2,
	},
	raider: {
		health: 1500,
		armor: 5,
		bonusPen: 7,
		weapon: "singlePlasma",
		secondary: null,
		speed: 32,
		destruction: 0.167,
	},
	destroyer: {
		health: 1600,
		armor: 18,
		bonusPen: 15,
		weapon: "singlePlasma",
		secondary: null,
		speed: 30,
		destruction: 0.167,
	},
	harvester: {
		health: 6000,
		armor: 20,
		bonusPen: 3,
		weapon: "doublePlasma",
		secondary: null,
		speed: 12,
		destruction: 0.143,
	},
	abductor: {
		health: 4000,
		armor: 30,
		bonusPen: 2,
		weapon: "doublePlasma",
		secondary: null,
		speed: 20,
		destruction: 0.143,
	},
	transport: {
		health: 5000,
		armor: 32,
		bonusPen: 0,
		weapon: "doublePlasma",
		secondary: null,
		speed: 12,
		destruction: 0.125,
	},
	terror: {
		health: 6000,
		armor: 25,
		bonusPen: 0,
		weapon: "doublePlasma",
		secondary: null,
		speed: 14,
		destruction: 0.125,
	},
	battleship: {
		health: 9000,
		armor: 36,
		bonusPen: 25,
		weapon: "ufoFusion",
		secondary: null,
		speed: 20,
		destruction: 0.067,
	},
	assault: {
		health: 8000,
		armor: 28,
		bonusPen: 18,
		weapon: "doublePlasma",
		secondary: "singlePlasma",
		speed: 22,
		destruction: 0.067,
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

const FIRST_SHOT_DELAY_MAX = 2000;

// Strategy constants
const FRIENDLY_SKIES_MODIFIER = 15,
	UFO_ANALYSIS_BONUS_DMG = 0.1;

// Foundry bonuses
const AVIONICS_AIM_BONUS = 10,
	PEN_WEAPONS_BONUS_PEN = 5,
	COUNTERMEASURES_AIM_MALUS = 15,
	AFTERBURNERS_TIME_BONUS = 5000,
	ARMORED_FIGHTERS_HEALTH_BONUS = 1000;

function firstShotDelay() {
	return Math.floor(Math.random() * FIRST_SHOT_DELAY_MAX);
}

// Constructors
function Interceptor(
	type,
	kills,
	weapon,
	stance,
	deathAbort,
	killAbort,
	aim,
	dodge,
	name
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
	this.outcome = name; 
	// health calc
	this.health = this.type == "firestorm" ? 4000 : 2500;
	if (armoredFighters) {
		this.health += ARMORED_FIGHTERS_HEALTH_BONUS;
	}
	// armor
	this.armor = this.type == "firestorm" ? 25 : 5;

	// weapon bonuses
	this.aimBonus = Math.min(this.pilotKills * PILOT_BONUSES.aim, 30);
	if (avionics) {
		this.aimBonus += AVIONICS_AIM_BONUS;
	}
	if (friendlySkies) {
		this.aimBonus += FRIENDLY_SKIES_MODIFIER;
	}

	this.penetrationBonus = 0;
	if (this.type == "firestorm") {
		this.penetrationBonus += 5;
	}
	if (penWeapons) {
		this.penetrationBonus += PEN_WEAPONS_BONUS_PEN;
	}

	this.bonusDmg = 1 + this.pilotKills * PILOT_BONUSES.dmg;
	if (ufoAnalysis) {
		this.bonusDmg += UFO_ANALYSIS_BONUS_DMG;
	}

	// primary weapon stats
	this.hitChance = WEAPON_TABLE[this.weapon].hitChance + this.aimBonus;

	this.shotDelay = WEAPON_TABLE[this.weapon].shotDelay;

	this.penetration =
		WEAPON_TABLE[this.weapon].penetration + this.penetrationBonus;

	this.baseDmg = Math.round(WEAPON_TABLE[this.weapon].dmg * this.bonusDmg);

	this.firstShotTime = firstShotDelay();

	// secondary weapon stats
	if (this.secondary) {
		this.secondaryHitChance =
			WEAPON_TABLE[this.secondary].hitChance + this.aimBonus;

		this.secondaryShotDelay = WEAPON_TABLE[this.secondary].shotDelay;

		this.secondaryPenetration =
			WEAPON_TABLE[this.secondary].penetration + this.penetrationBonus;

		this.secondaryDmg = WEAPON_TABLE[this.secondary].dmg * this.bonusDmg;

		this.secondaryFirstShotTime = firstShotDelay();
	}

	this.speed = this.type == "firestorm" ? 15 : 10;
}

function Ufo(type, research, startHealth) {
	this.type = type;
	this.researchUpgrade = Math.floor(research / 30);
	this.startingHealth = startHealth / 100;

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
		this.aimBonus -= COUNTERMEASURES_AIM_MALUS;
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

	this.firstShotTime = firstShotDelay();

	// secondary weapon stats
	if (this.secondary) {
		this.secondaryHitChance =
			WEAPON_TABLE[this.secondary].hitChance + this.aimBonus;

		this.secondaryShotDelay = WEAPON_TABLE[this.secondary].shotDelay;

		this.secondaryPenetration =
			WEAPON_TABLE[this.secondary].penetration + this.penetrationBonus;

		this.secondaryDmg = WEAPON_TABLE[this.secondary].dmg + this.bonusDmg;

		this.secondaryFirstShotTime = firstShotDelay();
	}

	// ufo speed
	this.speed = UFO_TABLE[this.type].speed;

	this.destruction = UFO_TABLE[this.type].destruction;
}

function AirCombat(interceptor, ufo) {
	this.xcomHealth = interceptor.health;
	this.ufoHealth = ufo.health;
	this.outcome = new Results();
	this.interceptionTime = afterburners
		? AFTERBURNERS_TIME_BONUS + Math.floor(30000 * (interceptor.speed / ufo.speed))
		: Math.floor(30000 * (interceptor.speed / ufo.speed));

	this.shotTimes = [];
	// Interceptor derived stats
	this.xcomHitChance = alwaysHit
		? 100
		: interceptor.hitChance + STANCE_BONUSES[interceptor.stance];
	this.xcomCritChance = Math.clamp(
		(interceptor.penetration - ufo.armor) / 2,
		5,
		25
	);

	this.createShotTimes = function(initial, delay, name, engagementTime) {
		let timer = initial;
		let shot;
		let shots = [];
		while (timer < engagementTime) {
			shot = [name, timer];
			shots.push(shot);
			timer += delay;
		}
		return shots;
	};

	this.shotTimes.push(
		this.createShotTimes(
			interceptor.firstShotTime,
			interceptor.shotDelay,
			"timerOne",
			this.interceptionTime
		)
	);

	if (interceptor.secondary) {
		this.xcomSecondaryHitChance = alwaysHit
			? 100
			: interceptor.hitChance + STANCE_BONUSES[interceptor.stance];

		this.xcomSecondaryCritChance = Math.clamp(
			(interceptor.secondaryPenetration - ufo.armor) / 2,
			5,
			25
		);

		this.shotTimes.push(
			this.createShotTimes(
				interceptor.secondaryFirstShotTime,
				interceptor.secondaryShotDelay,
				"timerThree",
				this.interceptionTime
			)
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

	this.shotTimes.push(
		this.createShotTimes(
			ufo.firstShotTime,
			ufo.shotDelay,
			"timerTwo",
			this.interceptionTime
		)
	);

	if (ufo.secondary) {
		this.ufoSecondaryHitChance =
			ufo.secondaryHitChance + STANCE_BONUSES[interceptor.stance];

		this.ufoSecondaryCritChance = Math.clamp(
			(ufo.secondaryPenetration - interceptor.armor) / 2,
			5,
			25
		);

		this.shotTimes.push(
			this.createShotTimes(
				ufo.secondaryFirstShotTime,
				ufo.secondaryShotDelay,
				"timerFour",
				this.interceptionTime
			)
		);
	}

	this.killAbortHealth = ufo.health * interceptor.killAbortPercent;

	this.ufoDestroyed = function(health) {
		return -health * ufo.destruction;
	};

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

	this.xcomPrimary = function() {
		console.log("XCOM shoots primary");
		return this.xcomShoots(
			this.xcomHitChance,
			this.effDmg(interceptor.baseDmg, ufo.armor, interceptor.penetration),
			this.xcomCritChance,
			this.xcomAimModule
		);
	};

	this.xcomSecondary = function() {
		console.log("XCOM shoots secondary");
		return this.xcomShoots(
			this.xcomSecondaryHitChance,
			this.effDmg(
				interceptor.secondaryDmg,
				ufo.armor,
				interceptor.secondaryPenetration
			),
			this.xcomSecondaryCritChance
		);
	};

	this.ufoPrimary = function() {
		console.log("UFO shoots primary");
		return this.ufoShoots(
			this.ufoHitChance,
			this.effDmg(ufo.baseDmg, interceptor.armor, ufo.penetration),
			this.ufoCritChance,
			this.xcomDodgeModule
		);
	};

	this.ufoSecondary = function() {
		console.log("UFO shoots secondary");
		return this.ufoShoots(
			this.ufoSecondaryHitChance,
			this.effDmg(
				ufo.secondaryDmg,
				interceptor.armor,
				ufo.secondaryPenetration
			),
			this.secondaryUfoCritChance,
			this.xcomDodgeModule
		);
	};
}


// Air combat results
function Results() { 
	this.kill = { number: 0, destroyed: 0, xcomHealth: 0 };
	this.killAbort = { number: 0, ufoHealth: 0, xcomHealth: 0 };
	this.stalemate = { number: 0, ufoHealth: 0, xcomHealth: 0 };
	this.deathAbort = { number: 0, ufoHealth: 0, xcomTimer: 0 };
	this.death = { number: 0, ufoHealth: 0, ufoTimer: 0 };
}

function calculateResults(outcome, interceptorHealth, ufoHealth) {
	let kill = outcome.kill,
	 killAbort = outcome.killAbort,
	 stalemate = outcome.stalemate,
	 deathAbort = outcome.deathAbort,
	 death = outcome.death;

	 const results = [];
	//  Kill calcs
	 results.push(Math.round((kill.number / simulations) * 100));
	 results.push(Math.round(kill.destroyed / kill.number));
	 results.push(Math.round(((kill.xcomHealth / kill.number) / interceptorHealth) * 100));
	//  Kill Abort calcs
	 results.push(Math.round((killAbort.number / simulations) * 100));
	 results.push(Math.round(((killAbort.ufoHealth / killAbort.number) / ufoHealth) * 100));
	 results.push(Math.round(((killAbort.xcomHealth / killAbort.number) / interceptorHealth) * 100));
	//  Stalemate calcs
	 results.push(Math.round((stalemate.number / simulations) * 100));
	 results.push(Math.round(((stalemate.ufoHealth / stalemate.number) / ufoHealth) * 100));
	 results.push(Math.round(((stalemate.xcomHealth / stalemate.number) / interceptorHealth) * 100));
	//  Death Abort calcs
	 results.push(Math.round((deathAbort.number / simulations) * 100));
	 results.push(Math.round(((deathAbort.ufoHealth / deathAbort.number) / ufoHealth) * 100));
	 results.push((deathAbort.xcomTimer / deathAbort.number) / 1000);
	//  Death calcs
	 results.push(Math.round((death.number / simulations) * 100));
	 results.push(Math.round(((death.ufoHealth / death.number) / ufoHealth) * 100));
	 results.push((death.ufoTimer / death.number) / 1000);
	
	 return results;
}



function displayResults(column, results) {
	for (let i = 0; i < results.length; i++) {
		if (isNaN(results[i])) {
			column[i].innerHTML = '-';
		// These two indicies are for Engagement times so no % appended
		} else if (i === 11 || i === 14) {
			column[i].innerHTML = results[i].toFixed(2);
		} else {
			column[i].innerHTML = results[i] + '%';
		}
	}
}

// Functions to update air combat results objects
function updateKill(outcome, xcomHealth, destroyedCalc) {
	outcome.kill.number += 1;
	outcome.kill.xcomHealth += xcomHealth;
	outcome.kill.destroyed += +Math.clamp(destroyedCalc, 0, 100).toFixed(1);
};
function updateKillAbort(outcome, xcomHealth, ufoHealth) {
	outcome.killAbort.number += 1;
	outcome.killAbort.xcomHealth += xcomHealth;
	outcome.killAbort.ufoHealth += ufoHealth;
};
function updateStalemate(outcome, xcomHealth, ufoHealth) {
	outcome.stalemate.number += 1;
	outcome.stalemate.xcomHealth += xcomHealth;
	outcome.stalemate.ufoHealth += ufoHealth;
};
function updateDeathAbort(outcome, ufoHealth, time) {
	outcome.deathAbort.number += 1;
	outcome.deathAbort.ufoHealth += ufoHealth;
	outcome.deathAbort.xcomTimer += time;
};
function updateDeath(outcome, ufoHealth, time) {
	outcome.death.number += 1;
	outcome.death.ufoHealth += ufoHealth;
	outcome.death.ufoTimer += time;
};

function engagement(interception) {
	let timers = interception.shotTimes.flat().sort((a, b) => a[1] - b[1]);
	let outcome = interception.outcome;
	for (let i = 0; i < timers.length; i++) {
		if (timers[i][0] == "timerOne") {
			interception.ufoHealth -= interception.xcomPrimary();
			console.log("xcom health: " + interception.xcomHealth);
			console.log("ufo health: " + interception.ufoHealth);
			console.log("timerOne: " + timers[i][1]);
		} else if (timers[i][0] == "timerTwo") {
			interception.xcomHealth -= interception.ufoPrimary();
			console.log("xcom health: " + interception.xcomHealth);
			console.log("ufo health: " + interception.ufoHealth);
			console.log("timerTwo: " + timers[i][1]);
		} else if (timers[i][0] == "timerThree") {
			interception.ufoHealth -= interception.xcomSecondary();
			console.log("xcom health: " + interception.xcomHealth);
			console.log("ufo health: " + interception.ufoHealth);
			console.log("timerThree: " + timers[i][1]);
		} else {
			interception.xcomHealth -= interception.ufoSecondary();
			console.log("xcom health: " + interception.xcomHealth);
			console.log("ufo health: " + interception.ufoHealth);
			console.log("timerFour: " + timers[i][1]);
		}

		if (
			interception.xcomHealth < interception.deathAbortHealth &&
			interception.xcomHealth > 0
		) {
			return updateDeathAbort(outcome, interception.ufoHealth, timers[i][1]);
		} else if (interception.xcomHealth < 0) {
			return updateDeath(outcome, interception.ufoHealth, timers[i][1]);
		} else if (
			interception.ufoHealth < interception.killAbortHealth &&
			interception.ufoHealth > 0
		) {
			return updateKillAbort(outcome, interception.xcomHealth, interception.ufoHealth);
		} else if (interception.ufoHealth < 0) {
			return updateKill(
				outcome, interception.xcomHealth,
				interception.ufoDestroyed(interception.ufoHealth)
			);
		}
	}
	return updateStalemate(outcome, interception.xcomHealth, interception.ufoHealth);
}

function calculateInterceptorStats (interceptor, ufo, interception) {
	let stats = [];

	let armorMitigation = interception.armorMitigation(ufo.armor, interceptor.penetration);
	let minDmgPerHit = interceptor.baseDmg * (1 - armorMitigation);
	let maxDmgPerCrit = minDmgPerHit * 3;
	let primaryDPS = damagePerSecond(minDmgPerHit, interception.xcomCritChance, interception.xcomHitChance, interceptor.shotDelay);
	let secDmgPerHit = interceptor.secondaryDmg * (1 - armorMitigation);
	let secondaryDPS = interceptor.secondary ? damagePerSecond(secDmgPerHit, interception.xcomSecondaryCritChance, interception.xcomSecondaryHitChance, interceptor.secondaryShotDelay) : 0;
	let secToKill = ufo.health / (primaryDPS + secondaryDPS);
	let engagementsPerKill = secToKill / interception.interceptionTime;

	stats.push(interceptor.health);
	stats.push(interceptor.armor);
	stats.push(interceptor.penetration);
	stats.push(interception.interceptionTime);
	stats.push(interceptor.weapon);
	stats.push(interception.xcomHitChance);
	stats.push(armorMitigation);
	stats.push(minDmgPerHit.toFixed(1));
	stats.push(interception.xcomCritChance);
	stats.push(maxDmgPerCrit.toFixed(1));
	stats.push(primaryDPS.toFixed(1));
	stats.push(secondaryDPS.toFixed(1));
	stats.push(secToKill.toFixed(1));
	stats.push((engagementsPerKill * 1000).toFixed(1));

	return stats;
}

function displayInterceptorStats(column, stats) {
	for (let i = 0; i < stats.length; i++) {
		 if (i === 5 || i === 6 || i === 8) {
			column[i].innerHTML = stats[i] + '%';
		} else {
		column[i].innerHTML = stats[i];
		}
	}
}

function damagePerSecond (minDmg, critChance, hitChance, shotDelay) {
	return (((minDmg * 1.25) + ((minDmg * 1.25) * critChance)) * hitChance) / shotDelay;
}
