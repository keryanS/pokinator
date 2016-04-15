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

var pokemons = new Array();
var quests = new Array();
var actual = new Quest();
var historiqueResp = new Array();
var nbQuestions = 0;
var pokemonTrouve;


window.onload = load_data();

function do_start() {
	actual = quests[0];
	document.getElementById("userInterface").style.width = "150px";
	document.getElementById("text1").textContent = actual.txt;
	document.getElementById("btnOk").style.display = "none";
	document.getElementById("btnYes").style.display = "block";
	document.getElementById("btnNo").style.display = "block";
}

// todo afficher l'erreur
function show_error(erreur){
	console.log(erreur);
}

function load_data() {
	var allQuestions = new Array();
	var allResponses = new Array();
	
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
	var typesQuestion = new Array();
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
		var yesRslt = new Array();
		var noRslt = new Array();
		for (var j = 0; j < allResponses.length; j++){
			// pour toutes les réponses relative à cette question
			if(allResponses[j]['idQuestion'] == allQuestions[i]['id']){
				// si la réponse est oui
				if(allResponses[j]['response'] == 1){
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
	if(nbQuestions<20) {
		do_yes_next_question();
	}
	else if(pokemonTrouve === undefined){
		do_finish(1);
	}
	else{

		document.getElementById("text1").textContent = "je suis trop fort";
		document.getElementById("btnAgain").style.display = "block";
		document.getElementById("btnYes").style.display = "none";
		document.getElementById("btnNo").style.display = "none";
	}
}

function do_yes_next_question(){
	nbQuestions++;

	for(var i=0; i < actual.yesResults.length; i++){
		actual.yesResults[i].score += 1;
		console.log(actual.yesResults[i].pokemonName+" : "+actual.yesResults[i].score);
	}

	for(var i=0; i < actual.noResults.length; i++){
		actual.noResults[i].score -= 1;
		console.log(actual.noResults[i].pokemonName+" : "+actual.noResults[i].score);
	}

	// on ajoute la réponse à l'historique
	var respYes = new Resp(actual,1);
	historiqueResp.push(respYes);
	for(var i=0;i<historiqueResp.length;i++){
		console.log(historiqueResp[i].question.txt);
	}
	actual.alreadyAsk = true;

	if(actual.typeQuestion){
		actual.typeQuestion.alreadyAsk = true;
		console.log("Type deja trouvé : "+actual.typeQuestion.nameType);
	}
	
	nextQuestion();

	//visual
	document.getElementById("text1").textContent = actual.txt;
}

function do_no() {
	// TODO : 20 max && score 1er >>> score 2eme
	if(nbQuestions<20) {
		do_no_next_question();
	}
	else if(pokemonTrouve === undefined){
		do_finish(0);
	}
	else {
		
		//visual
		document.getElementById("text1").textContent = "I couldn't find your animal. What animal did you think?";
		document.getElementById("btnYes").style.display = "none";
		document.getElementById("btnNo").style.display = "none";
		document.getElementById("animName").style.display = "block";
		document.getElementById("textDiff").textContent = "Difference from a " + pokemonTrouve.pokemonName + ": ";
		document.getElementById("animDiff").style.display = "block";
		document.getElementById("btnReady").style.display = "block";
	}
}

function do_no_next_question(){
	nbQuestions++;
	for(var i=0; i < actual.yesResults.length; i++){
		actual.yesResults[i].score -= 1;
		console.log(actual.yesResults[i].pokemonName+" : "+actual.yesResults[i].score);
	}

	for(var i=0; i < actual.noResults.length; i++){
		actual.noResults[i].score += 1;
		console.log(actual.noResults[i].pokemonName+" : "+actual.noResults[i].score);
	}

	// on ajoute la réponse à l'historique
	var respNo = new Resp(actual,0);
	historiqueResp.push(respNo);
	for(var i=0;i<historiqueResp.length;i++){
		console.log(historiqueResp[i].question.txt);
	}

	actual.alreadyAsk = true;

	nextQuestion();
	
	//visual
	document.getElementById("text1").textContent = actual.txt;
}

function do_finish(lastResponse){
	var maxScore=-999;
	for(var i=1; i<pokemons.length; i++){
		if(pokemons[i].score > maxScore) {
			maxScore = pokemons[i].score;
			pokemonTrouve = pokemons[i];
		}
	}
	// on ajoute la réponse à l'historique
	var respNo = new Resp(actual,lastResponse);
	historiqueResp.push(respNo);
	
	actual.alreadyAsk = true;

	//visual
	document.getElementById("text1").textContent = pokemonTrouve.txt;
}

function nextQuestion(){
	var i=0; 
	for(i;i<quests.length;i++){
		if( !quests[i].alreadyAsk ){
			console.log(quests[i]);
			if(quests[i].typeQuestion){
				if(!quests[i].typeQuestion.alreadyAsk){
					actual = quests[i];
					break;
				}
			}
			else{
				actual = quests[i];
				break;
			}
		}
	}
	if(i==quests.length){
		alert("on a plus de questions !");
	}

}

function do_again() {
	for(var i=1; i < pokemons.length; i++){
		pokemons[i].score = 0;
	}
	for(var i=0; i < quests.length; i++){
		quests[i].alreadyAsk = false;
	}
	nbQuestions = 0;
	pokemonTrouve = undefined;
	actual = quests[Math.floor( (Math.random() * quests.length) )];
	alreadyAsk = new Array();
	historiqueResp = new Array();
	//visual
	document.getElementById("userInterface").style.width = "100px";
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
		var existingPokemons = jQuery.extend({}, pokemons);
		pokeTmp = new Pokemon(document.getElementById("inpName").value);
		questTmp = new Quest(document.getElementById("inpDiff").value, [pokeTmp], existingPokemons);
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