
//"Classes"
function Quest(txt, yesResult, noResult, priority, typeQuestion) {
	this.txt = txt;
	if(yesResult === undefined && noResult === undefined){
		this.yesResults = new Array();
		this.noResults = new Array();
	}
	else{
		this.yesResults = yesResult;
		this.noResults = noResult;
	}
	if(priority === undefined){
		this.priority = 1;
	}
	else{
		this.priority = priority;
	}
	if(typeQuestion){
		this.typeQuestion=typeQuestion;
	}
	this.alreadyAsk = false;

	// TODO ajouter un niveau d'importance ( si la question est discriminante +5 score )
}

function Pokemon(pokemonName) {
	this.txt = "Ton pokemon est " + pokemonName + "?";
	this.pokemonName = pokemonName;
	this.score = 0;
}

function TypeQuestion(typeQuestion){
	this.nameType = typeQuestion;
	this.alreadyAsk = false;
}

function Resp(question, response){
	this.question = question;
	this.response = response;
}

/*
*	return an array json of all pokemons
*/
function getPokemons(){
	return new Promise(function(resolve, reject){
		$.ajax({ url: 'php/controller.php',
	        data: {method: 'getPokemons'},
	        type: 'post',
	        success: function(output) {
	        	if (output != null && output!=""){
	            	return resolve(output);
	            }
	            else{
	            	return reject("Aucun élément trouvé");
	            }
	        },
	        error:function(error){
	        	return reject(error);
	        }

		});
	});
}

/**
*	return a Pokemon of the pokemon :id
*/
function getPokemonById($id){
	return new Promise(function(resolve, reject){
		$.ajax({ url: 'php/controller.php',
	        data: {method:'getPokemonById',id:$id},
	        type: 'post',
	        dataType: 'json',
	        success: function(output) {
	        	if (output != null && output!=""){
	            	return resolve(output);
	            }
	            else{
	            	return reject("Aucun élément trouvé");
	            }
	        },
	        error:function(error){
	        	return reject(error);
	        }

		});
	});
}



/*
*	return an array json of all responses
*/
function getResponses(){
	return new Promise(function(resolve, reject){
		$.ajax({ url: 'php/controller.php',
	        data: {method: 'getResponses'},
	        type: 'post',
	        success: function(output) {
	        	if (output != null && output!=""){
	            	return resolve(output);
	            }
	            else{
	            	return reject("Aucun élément trouvé");
	            }
	        },
	        error:function(error){
	        	return reject(error);
	        }

		});
	});
}

/*
*	return an array json of all responses
*/
function getQuestions(){
	return new Promise(function(resolve, reject){
		$.ajax({ url: 'php/controller.php',
	        data: {method: 'getQuestions'},
	        type: 'post',
	        success: function(output) {
	        	if (output != null && output!=""){
	            	return resolve(output);
	            }
	            else{
	            	return reject("Aucun élément trouvé");
	            }
	        },
	        error:function(error){
	        	return reject(error);
	        }

		});
	});
}