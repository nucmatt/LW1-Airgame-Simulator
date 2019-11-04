var airCombat = {
  ufoHealth: 1000,
  ufoHitChance: 50,
  ufoShotDelay: 2000,
  ufoEffDmg: 200,
  xcomHealth: 1000,
  xcomHitChance: 80,
  xcomShotDelay: 2000,
  xcomEffDmg: 200,
  interceptionTime: 8000,

  shoot: function() {
    if (this.shotChance() <= this.xcomHitChance) {
      return this.rollDmg(this.xcomEffDmg, this.ufoHealth);
    } else {
      return console.log("miss");
    }
  },

  rollDmg: function(effDmg, health) {
    let shotDmg = Math.round(effDmg * (Math.random() * 0.5 + 1));
    console.log(shotDmg);
    return this.ufoHealth -= shotDmg;
  },

  shotChance: function() {
    return Math.floor(Math.random() * 100 + 1);
  }
};

timer = Math.floor(Math.random() * 2000);

while (airCombat.ufoHealth > 0 && timer < airCombat.interceptionTime) {
  console.log(timer);
  console.log(airCombat.shoot());
  timer += airCombat.xcomShotDelay;
  console.log(timer);
}
// console.log(airCombat.shoot());
// console.log(airCombat.rollDmg());
// console.log(airCombat.ufoHealth)
// console.log(airCombat.shoot());
// console.log(airCombat.rollDmg());
// console.log(airCombat.ufoHealth);
