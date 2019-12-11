

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
    destruction: 0.002
  },
  fighter: {
    health: 850,
    armor: 12,
    bonusPen: 7,
    weapon: "singlePlasma",
    secondary: null,
    speed: 40,
    destruction: 0.002
  },
  raider: {
    health: 1500,
    armor: 5,
    bonusPen: 7,
    weapon: "singlePlasma",
    secondary: null,
    speed: 32,
    destruction: 0.00167
  },
  destroyer: {
    health: 1600,
    armor: 18,
    bonusPen: 15,
    weapon: "singlePlasma",
    secondary: null,
    speed: 30,
    destruction: 0.00167
  },
  harvester: {
    health: 6000,
    armor: 20,
    bonusPen: 3,
    weapon: "doublePlasma",
    secondary: null,
    speed: 12,
    destruction: 0.00143
  },
  abductor: {
    health: 4000,
    armor: 30,
    bonusPen: 2,
    weapon: "doublePlasma",
    secondary: null,
    speed: 20,
    destruction: 0.00143
  },
  transport: {
    health: 5000,
    armor: 32,
    bonusPen: 0,
    weapon: "doublePlasma",
    secondary: null,
    speed: 12,
    destruction: 0.00125
  },
  terror: {
    health: 6000,
    armor: 25,
    bonusPen: 0,
    weapon: "doublePlasma",
    secondary: null,
    speed: 14,
    destruction: 0.00125
  },
  battleship: {
    health: 9000,
    armor: 36,
    bonusPen: 25,
    weapon: "ufoFusion",
    secondary: null,
    speed: 20,
    destruction: 0.00067
  },
  assault: {
    health: 8000,
    armor: 28,
    bonusPen: 18,
    weapon: "doublePlasma",
    secondary: "singlePlasma",
    speed: 22,
    destruction: 0.00067
  },
  overseer: {
    health: 2500,
    armor: 40,
    bonusPen: 25,
    weapon: "doublePlasma",
    secondary: "singlePlasma",
    speed: 60,
    destruction: 0
  }
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
  // hitChance calc
  this.hitChance =
    WEAPON_TABLE[this.weapon].hitChance +
    Math.min(this.pilotKills * PILOT_BONUSES.aim, 30);
  if (avionics) {
    this.hitChance += 10;
  }
  // weapon shot delay
  this.shotDelay = WEAPON_TABLE[this.weapon].shotDelay;
  // armor penetration
  this.penetration = WEAPON_TABLE[this.weapon].penetration;
  if (this.type == "firestorm") {
    this.penetration += 5;
  }
  if (penWeapons) {
    this.penetration += 5;
  }
  // weapon damage calc
  this.baseDmg = (
    WEAPON_TABLE[this.weapon].dmg *
    (1 + this.pilotKills * PILOT_BONUSES.dmg)
  ).toFixed(1);

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
  this.armor = UFO_TABLE[this.type].armor;
  // hitChance calc
  this.hitChance =
    WEAPON_TABLE[this.weapon].hitChance +
    this.researchUpgrade * RESEARCH_BONUSES.aim;
  if (countermeasures) {
    this.hitChance -= 15;
  }
  // weapon shot delay
  this.shotDelay = WEAPON_TABLE[UFO_TABLE[this.type].weapon].shotDelay;
  // penetration
  this.penetration =
    UFO_TABLE[this.type].bonusPen +
    WEAPON_TABLE[UFO_TABLE[this.type].weapon].penetration;
  // weapon damage
  this.baseDmg = WEAPON_TABLE[UFO_TABLE[this.type].weapon].dmg +=
    this.researchUpgrade * RESEARCH_BONUSES.dmg;
  // ufo speed
  this.speed = UFO_TABLE[this.type].speed;
  this.destruction = UFO_TABLE[this.type].destruction;
}
// Objects
let interceptor1 = new Interceptor(...buildInterceptor()[0])

console.log(interceptor1);
console.log("INTERCEPTOR BASE STATS");
console.log("xcom type: " + interceptor1.type);
console.log("interceptor 1 health: " + interceptor1.health);
console.log("interceptor 1 armor: " + interceptor1.armor);
console.log("interceptor 1 weapon: " + interceptor1.weapon);
console.log("interceptor 1 secondary: " + interceptor1.secondary);
console.log("interceptor 1 hitChance: " + interceptor1.hitChance);
console.log("interceptor 1 shotDelay: " + interceptor1.shotDelay);
console.log("interceptor 1 penetration: " + interceptor1.penetration);
console.log("interceptor 1 base damage: " + interceptor1.baseDmg);
console.log("interceptor 1 speed: " + interceptor1.speed);
console.log("death abort %: " + interceptor1.deathAbortPercent);
console.log("kill abort %: " + interceptor1.killAbortPercent);
console.log('aim module uses: ' + interceptor1.aimModule);
console.log('dodge module uses: ' + interceptor1.dodgeModule);

let ufo = new Ufo("scout", 0, 100, "low", false);

console.log("UFO BASE STATS");
console.log("ufo type: " + ufo.type);
console.log("ufo health: " + ufo.health);
console.log("ufo armor: " + ufo.armor);
console.log("ufo weapon: " + ufo.weapon);
console.log("ufo secondary: " + ufo.secondary);
console.log("ufo hitChance: " + ufo.hitChance);
console.log("ufo health: " + ufo.health);
console.log("ufo shotDelay: " + ufo.shotDelay);
console.log("ufo penetration: " + ufo.penetration);
console.log("ufo base damage: " + ufo.baseDmg);
console.log("ufo speed: " + ufo.speed);
console.log("ufo researchUpgrade: " + ufo.researchUpgrade);

function AirCombat(interceptor, ufo) {
  this.interceptionTime = afterburners
    ? 5000 + Math.floor(30000 * (interceptor.speed / ufo.speed))
    : Math.floor(30000 * (interceptor.speed / ufo.speed)),

  this.xcomHitChance = (interceptor.hitChance +=
    STANCE_BONUSES[interceptor.stance]),

  this.xcomCritChance = Math.clamp((interceptor.penetration - ufo.armor) / 2, 5, 25),

  this.deathAbortHealth = interceptor.health * interceptor.deathAbortPercent,

  this.xcomAimModule = interceptor.aimModule,

  this.xcomDodgeModule = interceptor.dodgeModule,

  this.ufoHitChance = (ufo.hitChance += STANCE_BONUSES[interceptor.stance]),

  this.ufoCritChance = Math.clamp((ufo.penetration - interceptor.armor) / 2, 5, 25),

  this.killAbortHealth = ufo.health * interceptor.killAbortPercent,

  this.ufoDestroyed = function(health) {
    return -health * ufo.destruction;
  }

  this.xcomEffDmg = function() {
    base = interceptor.baseDmg;
    armorMitigation = Math.clamp(
      0.05 * (ufo.armor - interceptor.penetration),
      0,
      0.95
    );
    return (base * (1 - armorMitigation)).toFixed(1);
  },

  this.ufoEffDmg = function() {
    base = ufo.baseDmg;
    armorMitigation = Math.clamp(
      0.05 * (interceptor.armor - ufo.penetration),
      0,
      0.95
    );
    return (base * (1 - armorMitigation)).toFixed(1);
  },

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
  },

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
  },

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
  },

  this.shotChance = function() {
    roll = Math.floor(Math.random() * 100 + 1);
    console.log(roll);
    return roll;
  }
};

let interception1 = new AirCombat(interceptor1, ufo);

console.log("AIR COMBAT STATS")
console.log("interception time: " + interception1.interceptionTime);
console.log("xcom stance: " + interceptor1.stance);
console.log("xcom hit chance " + interception1.xcomHitChance);
console.log("xcom crit chance: " + interception1.xcomCritChance);
console.log("xcom aim module uses: " + interception1.xcomAimModule);
console.log("xcom dodge module uses: " + interception1.xcomDodgeModule);
console.log("xcom eff dmg: " + interception1.xcomEffDmg());
console.log("ufo hit chance: " + interception1.ufoHitChance);
console.log("ufo crit chance: " + interception1.ufoCritChance);
console.log("ufo eff dmg: " + interception1.ufoEffDmg());

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
  kill.destroyed += Math.clamp(interception1.ufoDestroyed(ufo.health), 0, 100).toFixed(3);
};
function updateKillAbort() {
  killAbort.number += 1;
  killAbort.ufoHealth += ufo.health;
  killAbort.xcomHealth += interceptor1.health;
};
function updateStalemate() {
  stalemate.number += 1;
  stalemate.ufoHealth += ufo.health;
  stalemate.xcomHealth += interceptor1.health;  
};
function updateDeathAbort() {
  deathAbort.number += 1;
  deathAbort.ufoHealth += ufo.health;
  deathAbort.xcomTimer += timerOne;
};
function updateDeath() {
  death.number += 1;
  death.ufoHealth += ufo.health;
  death.ufoTimer += timerTwo;
};

// Air combat simulation
timerOne = Math.floor(Math.random() * 2000);
timerTwo = Math.floor(Math.random() * 2000);

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
engagement: while ((timerOne && timerTwo) < interception1.interceptionTime) {
  if (timerOne < timerTwo) {
    while (timerOne < timerTwo) {
      console.log("xcom timer: " + timerOne + " ufo timer: " + timerTwo);
      console.log("XCOM shoots");
      console.log(
        "ufo health " +
          (ufo.health -= interception1.xcomShoots(
            interception1.xcomHitChance,
            interception1.xcomEffDmg(),
            interception1.xcomCritChance,
            interception1.xcomAimModule,

          ))
      );
      timerOne += interceptor1.shotDelay;
      if (ufo.health <= interception1.killAbortHealth && ufo.health > 0) {
        updateKillAbort();
        break engagement;
      } else if (ufo.health < 0) {
        updateKill();
        break engagement
      }
    }
  } else {
    while (timerOne >= timerTwo) {
      console.log("xcom timer: " + timerOne + " ufo timer: " + timerTwo);
      console.log("UFO shoots");
      console.log(
        "xcom health " +
          (interceptor1.health -= interception1.ufoShoots(
            interception1.ufoHitChance,
            interception1.ufoEffDmg(),
            interception1.ufoCritChance,
            interception1.xcomDodgeModule
          ))
      );
      timerTwo += ufo.shotDelay;
      if (interceptor1.health <= interception1.deathAbortHealth && interceptor1.health > 0) {
        updateDeathAbort();
        break engagement;
      } else if (interceptor1.health < 0) {
        updateDeath();
        break engagement;
      }
    }
  }
  if ((timerOne && timerTwo) > interception1.interceptionTime) {
    updateStalemate();
  }
}

console.log("INTERCEPTION RESULTS");
console.log('kill % : ' + kill.number + ' ' + kill.destroyed + ' ' + kill.xcomHealth);
console.log('killAbort % : ' + killAbort.number + ' ' + killAbort.ufoHealth + ' ' + killAbort.xcomHealth);
console.log('stalemate % : ' + stalemate.number + ' ' + stalemate.ufoHealth + ' ' + stalemate.xcomHealth);
console.log('deathAbort % : ' + deathAbort.number + ' ' + deathAbort.ufoHealth + ' ' + deathAbort.xcomTimer);
console.log('death % : ' + death.number + ' ' + death.ufoHealth + ' ' + death.ufoTimer);

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
