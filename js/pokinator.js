/* Copyright 2014 Lucas Jacques
 * This file is part of FindYourAnimal.
 * FindYourAnimal is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * FindYourAnimal is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License    along with FindYourAnimal.  
 * If not, see <http://www.gnu.org/licenses/>.
 */

var pokemons = [];
var quests = [];
var actual = new Quest();
var historiqueResp = [];
var nbQuestions = 0;
var pokemonTrouve = [];
var pokemonElimines = [];


window.onload = load_data();

function do_start() {
	nextQuestion();
	document.getElementById("text1").textContent = actual.txt;
	document.getElementById("btnOk").style.display = "none";
	document.getElementById("btnYes").style.display = "block";
	document.getElementById("btnNo").style.display = "block";
	document.getElementById("btnMaybeYes").style.display = "block";
	document.getElementById("btnMaybeNo").style.display = "block";
	document.getElementById("btnDontKnow").style.display = "block";
}

// todo afficher l'erreur
function show_error(erreur){
	console.log(erreur);
}

function load_data() {
	var allQuestions = [];
	var allResponses = [];
	
	// load pokemons
	getPokemons().then(function(allPokemonsJson){
		var allPokemons = JSON.parse(allPokemonsJson);
		// create pokemons
		for(var i=0; i<allPokemons.length;i++){
			pokemons[i+1] = new Pokemon(allPokemons[i]['name']);
		}	

		load_questions_responses();

	},function(erreur){
		show_error("Erreur lors du chargement des pokemons : " + erreur);
	});

}

function load_questions_responses(){
	getResponses().then(function(allResponsesJson){
		allResponses = JSON.parse(allResponsesJson);

		load_questions(allResponses);

	},function(erreur){
		show_error("Erreur lors du chargement des réponses : " + erreur);
	})
}

function load_questions(allResponses){
	getQuestions().then(function(allQuestionsJson){
		allQuestions = JSON.parse(allQuestionsJson);

		create_questions(allQuestions, allResponses);
		
	},function(erreur){
		show_error("Erreur lors du chargement des questions : " + erreur);
	})
}

function create_questions(allQuestions, allResponses){
	var typesQuestion = [];
	var typeQuestion;
	for (var i = 0; i < allQuestions.length ; i++){
		if(allQuestions[i]['typeQuestion'] !== undefined && allQuestions[i]['typeQuestion'] !== ""){
			var typeInArray = $.grep(typesQuestion, function(e){ return e.nameType == allQuestions[i]['typeQuestion']; })
			if(typeInArray.length>0){
				typeQuestion = typeInArray[0];
			}
			else{
				typeQuestion = new TypeQuestion(allQuestions[i]['typeQuestion']);
				typesQuestion.push(typeQuestion);
			}
		}
		else{
			typeQuestion = null;
		}
		var yesRslt = [];
		var noRslt = [];
		for (var j = 0; j < allResponses.length; j++){
			// pour toutes les réponses relative à cette question
			if(allResponses[j]['idQuestion'] == allQuestions[i]['id']){
				// si la réponse est oui
				if(allResponses[j]['response'] == 1 || allResponses[j]['response'] == true){
					// on ajoute le pokemon a la liste des yesResults de la quest
					yesRslt.push(pokemons[ allResponses[j]['idPokemon'] ]);
				}
				else{
					noRslt.push(pokemons[ allResponses[j]['idPokemon'] ]);
				}
			}
		}

		quests[i] = new Quest(allQuestions[i]['text'],yesRslt,noRslt,allQuestions[i]['priority'],typeQuestion);
	}
}

function do_yes() {
	if(actual) {
		do_yes_next_question();
	}
	else if(pokemonTrouve.length === 0){
		console.log("pokemon trouvé : "+pokemonTrouve.length );
		do_finish(1);
	}
	else{

		document.getElementById("text1").textContent = "je suis trop fort";
		document.getElementById("btnAgain").style.display = "block";
		document.getElementById("btnYes").style.display = "none";
		document.getElementById("btnNo").style.display = "none";
		document.getElementById("btnMaybeYes").style.display = "none";
		document.getElementById("btnMaybeNo").style.display = "none";
		document.getElementById("btnDontKnow").style.display = "none";
		
	}
}

function do_yes_next_question(){
	nbQuestions++;

	for(var i=0; i < actual.yesResults.length; i++){
		actual.yesResults[i].score += 5;
		console.log(actual.yesResults[i].pokemonName+" : "+actual.yesResults[i].score);
	}

	for(var i=0; i < actual.noResults.length; i++){
		actual.noResults[i].score -= 5;
		if(!pokemonInArray(actual.noResults[i], pokemonElimines)){
			pokemonElimines.push(actual.noResults[i]);
		}
		console.log(actual.noResults[i].pokemonName+" : "+actual.noResults[i].score);
	}

	add_to_historique(1);

	if(actual.typeQuestion){
		actual.typeQuestion.alreadyAsk = true;
	}
	
	if(nextQuestion())
		document.getElementById("text1").textContent = actual.txt;
	else
		do_finish(historiqueResp[historiqueResp.length]);
}

function do_maybe_yes(){
	if(actual) {
		do_maybe_yes_next_question();
	}
	else if(pokemonTrouve.length === 0){
		console.log("pokemon trouvé : "+pokemonTrouve.length );
		do_finish(1);
	}
	else{
		document.getElementById("text1").textContent = "je suis trop fort";
		document.getElementById("btnAgain").style.display = "block";
		document.getElementById("btnYes").style.display = "none";
		document.getElementById("btnNo").style.display = "none";
		document.getElementById("btnMaybeYes").style.display = "none";
		document.getElementById("btnMaybeNo").style.display = "none";
		document.getElementById("btnDontKnow").style.display = "none";
	}
}

function do_maybe_yes_next_question(){
	nbQuestions++;

	for(var i=0; i < actual.yesResults.length; i++){
		actual.yesResults[i].score += 3;
		console.log(actual.yesResults[i].pokemonName+" : "+actual.yesResults[i].score);
	}

	for(var i=0; i < actual.noResults.length; i++){
		actual.noResults[i].score -= 3;
		if(!pokemonInArray(actual.noResults[i], pokemonElimines)){
			pokemonElimines.push(actual.noResults[i]);
		}
		console.log(actual.noResults[i].pokemonName+" : "+actual.noResults[i].score);
	}

	add_to_historique(1);

	if(actual.typeQuestion){
		actual.typeQuestion.alreadyAsk = true;
	}
	
	if(nextQuestion())
		document.getElementById("text1").textContent = actual.txt;
	else
		do_finish(historiqueResp[historiqueResp.length]);
}

function do_dont_know(){
	add_to_historique();
	if(nextQuestion())
		document.getElementById("text1").textContent = actual.txt;
	else
		do_finish();
}

function do_no() {
	if(actual) {
		do_no_next_question();
	}
	else if(pokemonTrouve.length === 0){
		console.log("pokemon trouvé : "+pokemonTrouve.length );
		do_finish(0);
	}
	else {
		
		//visual
		document.getElementById("text1").textContent = "I couldn't find your animal. What animal did you think?";
		document.getElementById("btnYes").style.display = "none";
		document.getElementById("btnNo").style.display = "none";
		document.getElementById("btnMaybeYes").style.display = "none";
		document.getElementById("btnMaybeNo").style.display = "none";
		document.getElementById("btnDontKnow").style.display = "none";
		document.getElementById("animName").style.display = "block";
		document.getElementById("textDiff").textContent = "Difference avec :";
		for(var i=0; i<pokemonTrouve.length; i++){
			$("#textDiff").append("<li>"+pokemonTrouve[i].pokemonName + "</li>");
		}
		document.getElementById("animDiff").style.display = "block";
		document.getElementById("btnReady").style.display = "block";
	}
}

function do_no_next_question(){
	nbQuestions++;
	for(var i=0; i < actual.yesResults.length; i++){
		actual.yesResults[i].score -= 5;
		if(!pokemonInArray(actual.yesResults[i], pokemonElimines)){
			pokemonElimines.push(actual.yesResults[i]);
		}
		console.log(actual.yesResults[i].pokemonName+" : "+actual.yesResults[i].score);
	}

	for(var i=0; i < actual.noResults.length; i++){
		actual.noResults[i].score += 5;
		console.log(actual.noResults[i].pokemonName+" : "+actual.noResults[i].score);
	}

	add_to_historique(0);

	if(nextQuestion())
		document.getElementById("text1").textContent = actual.txt;
	else
		do_finish(historiqueResp[historiqueResp.length]);
}

function do_maybe_no() {
	if(actual) {
		do_maybe_no_next_question();
	}
	else if(pokemonTrouve.length === 0){
		console.log("pokemon trouvé : "+pokemonTrouve.length );
		do_finish(0);
	}
	else {
		
		//visual
		document.getElementById("text1").textContent = "I couldn't find your animal. What animal did you think?";
		document.getElementById("btnYes").style.display = "none";
		document.getElementById("btnNo").style.display = "none";
		document.getElementById("btnMaybeYes").style.display = "none";
		document.getElementById("btnMaybeNo").style.display = "none";
		document.getElementById("btnDontKnow").style.display = "none";
		document.getElementById("animName").style.display = "block";
		document.getElementById("textDiff").textContent = "Difference avec :";
		for(var i=0; i<pokemonTrouve.length; i++){
			$("#textDiff").append("<li>"+pokemonTrouve[i].pokemonName + "</li>");
		}
		document.getElementById("animDiff").style.display = "block";
		document.getElementById("btnReady").style.display = "block";
	}
}

function do_maybe_no_next_question(){
	nbQuestions++;
	for(var i=0; i < actual.yesResults.length; i++){
		actual.yesResults[i].score -= 3;
		if(!pokemonInArray(actual.yesResults[i], pokemonElimines)){
			pokemonElimines.push(actual.yesResults[i]);
		}
		console.log(actual.yesResults[i].pokemonName+" : "+actual.yesResults[i].score);
	}

	for(var i=0; i < actual.noResults.length; i++){
		actual.noResults[i].score += 3;
		console.log(actual.noResults[i].pokemonName+" : "+actual.noResults[i].score);
	}

	add_to_historique(0);

	if(nextQuestion())
		document.getElementById("text1").textContent = actual.txt;
	else
		do_finish(historiqueResp[historiqueResp.length]);
}

function do_finish(lastResponse){
	var maxScore = getMaxScore();

	for(var i=1; i<pokemons.length; i++){
		if(!pokemonInArray(pokemons[i], pokemonElimines)){
			pokemonTrouve.push(pokemons[i]);
		}
	}
	/*for(var i=1; i<pokemons.length; i++){
		if(pokemons[i].score == maxScore) {
			pokemonTrouve.push(pokemons[i]);
		}
	}*/

	if(lastResponse){
		add_to_historique(lastResponse);
	}

	if( pokemonTrouve.length > 1 ){
		var txtPokeTrouve = new Array("Ummh, j'hésite... Est-ce un d'eux ?");
		//visual
		for(var i=0; i<pokemonTrouve.length; i++){
			txtPokeTrouve.push(pokemonTrouve[i].pokemonName + " ");
		}
		document.getElementById("text1").textContent = txtPokeTrouve.join("");
	}
	else{
		document.getElementById("text1").textContent = pokemonTrouve[0].txt;
	}
	

}

function add_to_historique(lastResponse){
	if(lastResponse !== undefined){
		var resp = new Resp(actual,lastResponse);
		historiqueResp.push(resp);
	}	
	actual.alreadyAsk = true;
}

function getMaxScore(){
	var maxScore=-999;
	for(var i=1; i<pokemons.length; i++){
		if(pokemons[i].score > maxScore) {
			maxScore = pokemons[i].score;
		}
	}
	return maxScore;
}

function nextQuestion(){
	var i=0; 
	var maxEntropie = 0;
	var questMaxEntropie;
	for(i;i<quests.length;i++){
		var entropie = calcul_entropie(quests[i]);
		if(entropie>maxEntropie && !quests[i].alreadyAsk){
			if(quests[i].typeQuestion){
				if( !quests[i].typeQuestion.alreadyAsk ){
					maxEntropie = entropie;
					questMaxEntropie = quests[i];
				}
			}
			else{
				maxEntropie = entropie;
				questMaxEntropie = quests[i];
			}
		}
	}
	actual = questMaxEntropie;
	return questMaxEntropie;
}

function calcul_entropie(quest){
	var yesPokemons = [];
	var noPokemons = [];
	for(var i=0; i < quest.yesResults.length;i++){
		if( !pokemonInArray(quest.yesResults[i],pokemonElimines) )
			yesPokemons.push(quest.yesResults[i]);
	}
	for(var i=0; i < quest.noResults.length;i++){
		if( !pokemonInArray(quest.noResults[i],pokemonElimines) )
			noPokemons.push(quest.noResults[i]);
	}
	console.log(quest.txt + " : " + (yesPokemons.length)*(noPokemons.length));
	console.log("yesPokemon : "+yesPokemons.length);
	console.log("noPokemon : "+noPokemons.length);

	return (yesPokemons.length)*(noPokemons.length);
}

function do_again() {
	for(var i=1; i < pokemons.length; i++){
		pokemons[i].score = 0;
	}
	for(var i=0; i < quests.length; i++){
		quests[i].alreadyAsk = false;
	}
	nbQuestions = 0;
	pokemonTrouve = [];
	pokemonElimines = [];
	actual = nextQuestion();
	alreadyAsk = [];
	historiqueResp = [];
	//visual
	document.getElementById("text1").textContent = "Penses à un pokemon et je le trouve";
	document.getElementById("btnAgain").style.display = "none";
	document.getElementById("btnOk").style.display = "block";
}

function do_ready() {

	//exception
	if(document.getElementById("inpName").value === "" || (document.getElementById("inpDiff").value === "" || pokemonTrouve === undefined)) {
		show_error("Veuillez rentrer un nom de pokmemon et une question.");
	}
	else {
		// on clone le tableau des pokemons
		var existingPokemons = jQuery.extend({}, true, pokemons);
		var existingPokemonsArray = jQuery.makeArray( existingPokemons );
		pokeTmp = new Pokemon(document.getElementById("inpName").value);
		questTmp = new Quest(document.getElementById("inpDiff").value, [pokeTmp], existingPokemonsArray);
		console.log(pokeTmp.pokemonName+" dira oui a la question : " + questTmp.txt);

		pokemons.push(pokeTmp);
		quests.push(questTmp);	
		
		for(var i=0; i<historiqueResp.length; i++){
			if(historiqueResp[i].response == 1){
				historiqueResp[i].question.yesResults.push(pokeTmp);
				console.log(pokeTmp.pokemonName+" avait dit oui a la question : " + historiqueResp[i].question.txt);
			}
			else{
				historiqueResp[i].question.noResults.push(pokeTmp);
				console.log(pokeTmp.pokemonName+" avait dit non a la question : " + historiqueResp[i].question.txt);
			}
		}

		//visual
		document.getElementById("inpDiff").value = "";
		document.getElementById("inpName").value = "";
		document.getElementById("animName").style.display = "none";
		document.getElementById("animDiff").style.display = "none";
		document.getElementById("btnReady").style.display = "none";
		do_again();
	}

}

function do_return(){
	actual = historiqueResp[historiqueResp.length-1].question;
	var lastQuestion = historiqueResp[historiqueResp.length-1].question;
	var lastResponse = historiqueResp[historiqueResp.length-1].response;
	if(lastResponse==1 || lastResponse==true){
		for(var i=0;i<lastQuestion.yesResults.length;i++){
			// TODO changer -- en -= historiqueResp.question.yesResults[i].priority
			lastQuestion.yesResults[i].score--;
		}
		for(var i=0;i<lastQuestion.noResults.length;i++){
			// TODO changer ++ en += historiqueResp.question.yesResults[i].priority
			lastQuestion.noResults[i].score++;
		}
	}
	else{
		for(var i=0;i<lastQuestion.noResults.length;i++){
			// TODO changer -- en -= historiqueResp.question.yesResults[i].priority
			lastQuestion.noResults[i].score--;
		}
		for(var i=0;i<lastQuestion.yesResults.length;i++){
			// TODO changer ++ en += historiqueResp.question.yesResults[i].priority
			lastQuestion.yesResults[i].score++;
		}
	}
	console.log(actual);
	document.getElementById("text1").textContent = actual.txt;
	historiqueResp.pop();
}

function pokemonInArray(pokemon, pokemonsArray) { 
    for(var i=0; i < pokemonsArray.length; i++) { 
        if(pokemonsArray[i].pokemonName == pokemon.pokemonName){
        	return true; 
        }
    }
    return false; 
}