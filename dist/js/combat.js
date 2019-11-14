// Global variables
armoredFighters = false;
afterburners = false;
avionics = false;
penWeapons = false;
coilguns = false;
pulse = false;
sparrowhawks = false;
countermeasures = false;

const WEAPON_TABLE = {
  avalanche: { hitChance: 40, dmg: 340, penetration: 0, shotDelay: 2000 },
  stingray: { hitChance: 40, dmg: 200, penetration: 10, shotDelay: 1500 },
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
    speed: 42
  },
  fighter: {
    health: 850,
    armor: 12,
    bonusPen: 7,
    weapon: "singlePlasma",
    speed: 40
  },
  raider: {
    health: 1500,
    armor: 5,
    bonusPen: 7,
    weapon: "singlePlasma",
    speed: 32
  },
  destroyer: {
    health: 1600,
    armor: 18,
    bonusPen: 15,
    weapon: "singlePlasma",
    speed: 30
  },
  harvester: {
    health: 6000,
    armor: 20,
    bonusPen: 3,
    weapon: "doublePlasma",
    speed: 12
  },
  abductor: {
    health: 4000,
    armor: 30,
    bonusPen: 2,
    weapon: "doublePlasma",
    speed: 20
  },
  transport: {
    health: 5000,
    armor: 32,
    bonusPen: 0,
    weapon: "doublePlasma",
    speed: 12
  },
  terror: {
    health: 6000,
    armor: 25,
    bonusPen: 0,
    weapon: "doublePlasma",
    speed: 14
  },
  battleship: {
    health: 9000,
    armor: 36,
    bonusPen: 25,
    weapon: "ufoFusion",
    speed: 20
  },
  assault: {
    health: 8000,
    armor: 28,
    bonusPen: 18,
    weapon: "doublePlasma",
    speed: 22
  },
  overseer: {
    health: 2500,
    armor: 40,
    bonusPen: 25,
    weapon: "doublePlasma",
    speed: 60
  }
};

const RESEARCH_BONUSES = { health: 75, dmg: 8, aim: 2 };
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
  this.stance = stance;
  this.deathAbortPercent = deathAbort;
  this.killAbortPercent = killAbort;
  this.aimModule = aim;
  this.dodgeModule = dodge;
  // health calc
  this.health = function() {
    health = this.type == "firestorm" ? 4000 : 2500;
    if (armoredFighters) {
      health += 1000;
    }
    return health;
  };
  // armor
  this.armor = this.type == "firestorm" ? 25 : 5;
  // hitChance calc
  this.hitChance = function() {
    hitChance = WEAPON_TABLE[this.weapon].hitChance;
    this.pilotKills >= 10
      ? (hitChance += 30)
      : (hitChance += this.pilotKills * 3);
    if (avionics) {
      hitChance += 10;
    }
    return this.stance == "defensive"
      ? (hitChance -= 15)
      : this.stance == "aggressive"
      ? (hitChance += 15)
      : hitChance;
  };
  // weapon shot delay
  this.shotDelay = WEAPON_TABLE[this.weapon].shotDelay;
  // armor penetration
  this.penetration = function() {
    intBase = this.type == 'firestorm' ? 5 : 0;
    wpnBase = WEAPON_TABLE[this.weapon].penetration;
    penWpns = penWeapons ? 5 : 0;
    return intBase + wpnBase + penWpns;
  }
  // weapon damage calc
  this.effDmg = function() {
    return (
      WEAPON_TABLE[this.weapon].dmg *
      (1 + this.pilotKills * 0.01)
    ).toFixed(1);
  };
  this.speed = this.type == "firestorm" ? 15 : 10;
}

function Ufo(type, research, startHealth, altitude, alwaysHit) {
  this.type = type;
  this.researchUpgrade = research / 30;
  this.startingHealth = startHealth / 100;
  this.altitude = altitude;
  this.alwaysGetsHit = alwaysHit;
  // health calc
  this.health = (UFO_TABLE[this.type].health + (this.researchUpgrade * RESEARCH_BONUSES.health)) * this.startingHealth;
  // armor
  this.armor = UFO_TABLE[this.type].armor;
  // hitChance calc
  this.hitChance = function() {
    base = WEAPON_TABLE[UFO_TABLE[this.type].weapon].hitChance;
    researchBonus = this.researchUpgrade * RESEARCH_BONUSES.aim;
    hitChance = base + researchBonus;
    if (countermeasures) {
      hitChance -= 15;
    }
     interceptor1.stance == "defensive"
    ? (hitChance -= 15)
    : interceptor1.stance == "aggressive"
    ? (hitChance += 15)
    : hitChance;
    return hitChance >= 95 ? 95 : hitChance;
  }
  // weapon shot delay
  this.shotDelay = WEAPON_TABLE[UFO_TABLE[this.type].weapon].shotDelay;
  // penetration
  this.penetration = UFO_TABLE[this.type].bonusPen + WEAPON_TABLE[UFO_TABLE[this.type].weapon].penetration;
  // weapon damage
  // ufo speed
  this.speed = UFO_TABLE[this.type].speed;
}
// Objects
let interceptor1 = new Interceptor(
  "firestorm",
  0,
  "stingray",
  "balanced",
  0,
  0,
  false,
  false
);
console.log("interceptor 1 health: " + interceptor1.health());
console.log("interceptor 1 armor: " + interceptor1.armor);
console.log("interceptor 1 hitChance: " + interceptor1.hitChance());
console.log("interceptor 1 shotDelay: " + interceptor1.shotDelay);
console.log("interceptor 1 penetration: " + interceptor1.penetration());
console.log("interceptor 1 effDmg: " + interceptor1.effDmg());
console.log("interceptor 1 speed: " + interceptor1.speed);

let ufo = new Ufo("scout", 960, 100, "low", false);
console.log("ufo health: " + ufo.health);
console.log("ufo armor: " + ufo.armor);
console.log('ufo hitChance: ' + ufo.hitChance())
console.log("ufo health: " + ufo.health);
console.log("ufo shotDelay: " + ufo.shotDelay);
console.log("ufo penetration: " + ufo.penetration);
console.log("ufo speed: " + ufo.speed);
console.log("ufo researchUpgrade: " + ufo.researchUpgrade);

// initial air combat test craft objects
// let interceptor = {
//   health: 1000,
//   hitChance: 80,
//   shotDelay: 2000,
//   effDmg: 200
// };

// let ufo = {
//   health: 1000,
//   hitChance: 80,
//   shotDelay: 750,
//   effDmg: 200
// };

var airCombat = {
  interceptionTime: 28000,

  shoot: function(hitChance, effDmg) {
    if (this.shotChance() <= hitChance) {
      return this.rollDmg(effDmg);
    } else {
      console.log("miss");
      return this.rollDmg(0);
    }
  },

  rollDmg: function(effDmg) {
    var shotDmg = Math.round(effDmg * (Math.random() * 0.5 + 1));
    console.log("shot dmg " + shotDmg);
    return shotDmg;
  },

  shotChance: function() {
    return Math.floor(Math.random() * 100 + 1);
  }
};

// Air combat simulation
// timerOne = Math.floor(Math.random() * 2000);
// timerTwo = Math.floor(Math.random() * 2000);

timerOne = 500;
timerTwo = 1500;

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

// engagement: while ((timerOne && timerTwo) < airCombat.interceptionTime) {
//   if (timerOne < timerTwo) {
//     while (timerOne < timerTwo) {
//       console.log("xcom timer: " + timerOne + " ufo timer: " + timerTwo);
//       console.log(
//         "ufo health " +
//           (ufo.health -= airCombat.shoot(
//             interceptor.hitChance,
//             interceptor.effDmg
//           ))
//       );
//       timerOne += interceptor.shotDelay;
//       if (ufo.health <= 0) {
//         break engagement;
//       }
//     }
//   } else {
//     while (timerOne >= timerTwo) {
//       console.log("xcom timer: " + timerOne + " ufo timer: " + timerTwo);
//       console.log(
//         "xcom health " +
//           (interceptor.health -= airCombat.shoot(ufo.hitChance, ufo.effDmg))
//       );
//       timerTwo += ufo.shotDelay;
//       if (interceptor.health <= 0) {
//         break engagement;
//       }
//     }
//   }
// }

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
