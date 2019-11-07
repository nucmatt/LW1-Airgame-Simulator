// Constructors

// Objects
let interceptor = {
  health: 1000,
  hitChance: 80,
  shotDelay: 2000,
  effDmg: 200
};

let ufo = {
  health: 1000,
  hitChance: 80,
  shotDelay: 2000,
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

timerOne = 1500;
timerTwo = 1000;

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

engagement: while (timerOne < timerTwo) {
  console.log("xcom timer: " + timerOne + " ufo timer: " + timerTwo);
  console.log(
    "ufo health " +
      (ufo.health -= airCombat.shoot(interceptor.hitChance, interceptor.effDmg))
  );
  timerOne += interceptor.shotDelay;
  if (ufo.health <= 0) {
    break engagement;
  }
  while (timerTwo < timerOne) {
    console.log("xcom timer: " + timerOne + " ufo timer: " + timerTwo);
    console.log(
      "xcom health " +
        (interceptor.health -= airCombat.shoot(ufo.hitChance, ufo.effDmg))
    );
    timerTwo += ufo.shotDelay;
    if (interceptor.health <= 0) {
      break engagement;
    }
  }
  if ((timerOne && timerTwo) > airCombat.interceptionTime) {
    break;
  }
}

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
