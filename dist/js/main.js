 // Foundry Projects
 let armoredFighters,
    afterburners,
    avionicsecked,
    penWeaponschecked,
    sparrowhawks,
    countermeasures;

 // Strategy layer
 let friendlySkies,
 ufoAnalysis,
 sequentialInterceptions,
 gameDate;

 // Ufo
 let alienResearch,
    alwaysHit;

 alienResearch = document.getElementById('alien_research');
 gameDate = document.getElementById('game_date');
 
 document.getElementById('game_date').oninput = function() { alienResearch.value = setResearchByDate(gameDate, 1)}

 function setResearchByDate(date, multiplier) {
     let dateValue = Number(new Date(date.value));
    //  numbers below are values milliseconds for 03/01/2016 and milliseconds in a day
     let research = ((dateValue - 1456790400000) / 86400000) * multiplier;
     console.log(research);
     return research;
 }




// Number of simulations to run
const simulations = 50;

function buildInterceptor() {
	let interceptors = document.getElementsByClassName("interceptor");
	let interceptorInputs = [];
	for (let i = 0; i < interceptors.length; i++) {
		let interceptor = [];
		interceptor.push(interceptors[i].querySelector(".int_type").value);
		interceptor.push(interceptors[i].querySelector(".kills").value);
		interceptor.push(interceptors[i].querySelector(".int_wpn").value);
		interceptor.push(interceptors[i].querySelector(".stance").value);
		interceptor.push(interceptors[i].querySelector(".deathabort").value);
		interceptor.push(interceptors[i].querySelector(".killabort").value);
		interceptor.push(interceptors[i].querySelector(".aimmod").checked);
        interceptor.push(interceptors[i].querySelector(".dodgemod").checked);
        interceptor.push(interceptors[i].id);
		interceptorInputs.push(interceptor);
	}
	return interceptorInputs;
}

console.log(buildInterceptor());

function buildUfo() {
	let ufo = document.getElementById("ufo");
	let ufoInputs = [];
	ufoInputs.push(ufo.querySelector("#ufo_type").value);
	ufoInputs.push(ufo.querySelector("#alien_research").value);
	ufoInputs.push(ufo.querySelector("#start_health").value);

	return ufoInputs;
}

console.log(buildUfo());

document.getElementById("start_btn").onclick = function() {
	simulation();
};

function simulation() {
    // Foundry Projects
    armoredFighters = document.getElementById("AF").checked,
    afterburners = document.getElementById("afterburners").checked,
    avionics = document.getElementById("avionics").checked,
    penWeapons = document.getElementById("penWeapons").checked,
    sparrowhawks = document.getElementById("sparrowhawks").checked,
    countermeasures = document.getElementById("countermeasures").checked;

    // Strategy layer
    friendlySkies = document.getElementById("friendly_skies").checked,
    ufoAnalysis = document.getElementById("ufo_analysis").checked,
    sequentialInterceptions = document.getElementById("seq_int").checked;

    // Ufo
    alwaysHit = document.getElementById("always_hit").checked;

	console.log("armored fighters: " + armoredFighters);
	console.log("elerium afterburners: " + afterburners);
	console.log("enhanced avionics: " + avionics);
	console.log("penetrator weapons: " + penWeapons);
	console.log("wingtip sparrowhawks: " + sparrowhawks);
	console.log("ufo countermeasures: " + countermeasures);
	console.log("friendly skies: " + friendlySkies);
	console.log("ufo analysis: " + ufoAnalysis);
	console.log("sequential interceptions: " + sequentialInterceptions);
	console.log("ufo always gets hit: " + alwaysHit);
	console.log("start button pressed!");

	let interceptors = buildInterceptor(),
	 interceptorBlue = new Interceptor(...interceptors[0]),
	 interceptorGreen = new Interceptor(...interceptors[1]),
     interceptorRed = new Interceptor(...interceptors[2]),
	 ufo = new Ufo(...buildUfo()),
	 interceptionBlue = new AirCombat(interceptorBlue, ufo),
	 interceptionGreen = new AirCombat(interceptorGreen, ufo),
     interceptionRed = new AirCombat(interceptorRed, ufo),
     columnBlue = document.querySelectorAll("td.blue"),
     columnGreen = document.querySelectorAll("td.green"),
     columnRed = document.querySelectorAll("td.red"),
     resultsBlue,
     resultsGreen,
     resultsRed;
    
    console.log(interceptorBlue);
	console.log(interceptorGreen);
    console.log(interceptorRed);
    console.log(ufo);
    console.log(interceptionBlue);

    if (sequentialInterceptions) {
        for (let i = 0; i < simulations; i++) {
            interceptionBlue.xcomHealth = interceptorBlue.health;
            interceptionGreen.xcomHealth = interceptorGreen.health;
            interceptionRed.xcomHealth = interceptorRed.health;
            interceptionBlue.ufoHealth = ufo.health;
            console.log('Blue Ranger engages');
            console.log('Blue Ranger health: ' + interceptorBlue.health);
            console.log('UFO health: ' + ufo.health);
            engagement(interceptionBlue);
            if (interceptionBlue.ufoHealth < interceptionBlue.killAbortHealth) {
                console.log('UFO defeated')
                continue;
            } else {
                console.log('Green Ranger engages');
                console.log('Green Ranger health: ' + interceptorGreen.health);
                console.log('UFO health: ' + interceptionBlue.ufoHealth);
                interceptionGreen.ufoHealth = interceptionBlue.ufoHealth;
                engagement(interceptionGreen);
            };
            if (interceptionGreen.ufoHealth < interceptionGreen.killAbortHealth) {
                console.log('UFO defeated')
                continue;
            } else {
                console.log('Red Ranger engages');
                console.log('Red Ranger health: ' + interceptorRed.health);
                console.log('UFO health: ' + interceptionGreen.ufoHealth);
                interceptionRed.ufoHealth = interceptionGreen.ufoHealth;
                engagement(interceptionRed);
            };
            
        }
     
    } else {
        for (let i = 0; i < simulations; i++) {
            console.log('ENGAGEMENT BEGINS');
            interceptionBlue.xcomHealth = interceptorBlue.health;
            interceptionBlue.ufoHealth = ufo.health;
            engagement(interceptionBlue);
        }
        
        for (let i = 0; i < simulations; i++) {
            console.log('ENGAGEMENT BEGINS');
            interceptionGreen.xcomHealth = interceptorGreen.health;
            interceptionGreen.ufoHealth = ufo.health;
            engagement(interceptionGreen);
        }
        
        for (let i = 0; i < simulations; i++) {
            console.log('ENGAGEMENT BEGINS');
            interceptionRed.xcomHealth = interceptorRed.health;
            interceptionRed.ufoHealth = ufo.health;
            engagement(interceptionRed);
        }
    };
    
    console.log("Blue INTERCEPTION RESULTS");
    console.log(interceptionBlue.outcome);
    console.log("Green INTERCEPTION RESULTS");
    console.log(interceptionGreen.outcome);
    console.log("Red INTERCEPTION RESULTS");
    console.log(interceptionRed.outcome);
    
    resultsBlue = calculateResults(interceptionBlue.outcome, interceptorBlue.health, ufo.health)
    resultsGreen = calculateResults(interceptionGreen.outcome, interceptorGreen.health, ufo.health)
    resultsRed = calculateResults(interceptionRed.outcome, interceptorRed.health, ufo.health)
    displayResults(columnBlue, resultsBlue);
    displayResults(columnGreen, resultsGreen);
    displayResults(columnRed, resultsRed);
    // Below reflects cumulative kills across sequential interceptions
    if (sequentialInterceptions) {
        columnGreen[0].innerHTML = (resultsGreen[0] + resultsBlue[0]) + '%';
        columnRed[0].innerHTML = (resultsRed[0] + resultsGreen[0] + resultsBlue[0]) + '%';
    }
}
