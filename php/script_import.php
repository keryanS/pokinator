<?php
error_reporting(E_ALL);
require_once 'excel_reader2.php';
require_once 'db_connect.php';
$data = new Spreadsheet_Excel_Reader("reponses.xls");


$db = DB::getInstance();

$req = $db->prepare("INSERT INTO response (idPokemon, idQuestion, response) VALUES (:idPokemon, :idQuestion, :response)");
    

	for($pokeID=1;$pokeID<=50;$pokeID++){
		for($question=1;$question<=69;$question++){
			$req->execute(array(
				"idPokemon" => $pokeID, 
				"idQuestion" => $data->val(2,$question+1),
				"response" => $data->val($pokeID+2,$question+1)
            ));
		}
	}

echo 'FIN';	