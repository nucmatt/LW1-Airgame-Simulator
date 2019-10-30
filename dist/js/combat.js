var airCombat = {
  ufoHealth: 1000,
  hitChance: 80,
  effDmg: 200,

  shoot: function(hitChance) {
    let shot = Math.floor(Math.random() * 100 + 1);
    if (shot <= this.hitChance) {
      console.log(shot + " hit");
      return this.rollDmg();
    } else {
      return console.log(shot + " miss");
    }
  },

  rollDmg: function(effDmg, ufoHealth) {
    let shotDmg = Math.round(this.effDmg * (Math.random() * 0.5 + 1));
    console.log(shotDmg);
    return (this.ufoHealth -= shotDmg);
  }
};

while (airCombat.ufoHealth > 0) {
  console.log(airCombat.shoot());
  console.log(airCombat.ufoHealth);
}
// console.log(airCombat.shoot());
// console.log(airCombat.rollDmg());
// console.log(airCombat.ufoHealth)
// console.log(airCombat.shoot());
// console.log(airCombat.rollDmg());
// console.log(airCombat.ufoHealth);
