// Global variables
const armoredFighters = document.getElementById('AF').checked,
    afterburners = document.getElementById('afterburners').checked,
    avionics = document.getElementById('avionics').checked,
    penWeapons = document.getElementById('penWeapons').checked,
    sparrowhawks = document.getElementById('sparrowhawks').checked,
    countermeasures = document.getElementById('countermeasures').checked;

console.log('armored fighters: ' + armoredFighters);
console.log('elerium afterburners: ' + afterburners);
console.log('enhanced avionics: ' + avionics);
console.log('penetrator weapons: ' + penWeapons);
console.log('wingtip sparrowhawks: ' + sparrowhawks);
console.log('ufo countermeasures: ' + countermeasures);



function buildInterceptor() {
    let interceptors = document.getElementsByClassName('interceptor');
    let interceptorInputs = [];
    for (let i = 0; i < interceptors.length; i++){
        let interceptor = [];
        interceptor.push(interceptors[i].querySelector(".int_type").value);
        interceptor.push(interceptors[i].querySelector(".kills").value);
        interceptor.push(interceptors[i].querySelector(".int_wpn").value);
        interceptor.push(interceptors[i].querySelector(".stance").value);
        interceptor.push(interceptors[i].querySelector(".deathabort").value);
        interceptor.push(interceptors[i].querySelector(".killabort").value);
        interceptor.push(interceptors[i].querySelector(".aimmod").checked);
        interceptor.push(interceptors[i].querySelector(".dodgemod").checked);
        interceptorInputs.push(interceptor);
    }
    return interceptorInputs;
}

console.log(buildInterceptor());
