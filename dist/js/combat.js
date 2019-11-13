// Global variables
armoredFighters = false;
afterburners = false;
avionics = true;
pen_wpns = false;
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
  // weapon damage calc
  this.effDmg = function() {
    return (
      WEAPON_TABLE[this.weapon].dmg *
      (1 + this.pilotKills * 0.01)
    ).toFixed(1);
  };
}

function Ufo(type, research, startHealth, altitude, alwaysHit) {
  this.type = type;
  this.research = research;
  this.startingHealth = startHealth;
  this.altitude = altitude;
  this.alwaysGetsHit = alwaysHit;
  // health calc
  // armor
  // hitChance calc
  // weapon shot delay
  // weapon damage
}
// Objects
let interceptor1 = new Interceptor(
  "interceptor",
  0,
  "phoenix",
  "balanced",
  0,
  0,
  false,
  false
);
console.log('interceptor 1: ' + interceptor1.health());
console.log('interceptor 1: ' + interceptor1.armor);
console.log('interceptor 1: ' + interceptor1.hitChance());
console.log('interceptor 1: ' + interceptor1.shotDelay);
console.log('interceptor 1: ' + interceptor1.effDmg());

let interceptor = {
  health: 1000,
  hitChance: 80,
  shotDelay: 2000,
  effDmg: 200
};

let ufo = {
  health: 1000,
  hitChance: 80,
  shotDelay: 750,
  effDmg: 200
};

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
