<?php
require 'db_connect.php';

if ( isset ($_POST['method']) && !empty($_POST['method']) )
switch ($_POST['method']) {
	case 'getPokemons':
		echo safe_json_encode(getPokemons());
		break;
	case 'getPokemonById':
		echo safe_json_encode(getPokemons($_POST['id']));
		break;
    case 'getResponses':
        echo safe_json_encode(getResponses());
	   break;
    case 'getQuestions':
        echo safe_json_encode(getQuestions());
        break;
	default:
		# code...
		break;
}


function getPokemons(){
	$db = DB::getInstance();
	$result=$db->query('SELECT * FROM pokemon');
	return $result->fetchAll(PDO::FETCH_ASSOC);
}


function getPokemonById($id){
	$db = DB::getInstance();
	$result=$db->query("SELECT * FROM pokemon WHERE `id`=$id");
	return $result->fetchAll(PDO::FETCH_ASSOC);
}

function getResponses(){
    $db = DB::getInstance();
    $result=$db->query('SELECT * FROM response');
    return $result->fetchAll(PDO::FETCH_ASSOC);
}

function getQuestions(){
    $db = DB::getInstance();
    $result=$db->query('SELECT * FROM question ORDER BY `priority` DESC, RAND()');
    return $result->fetchAll(PDO::FETCH_ASSOC);
}

function safe_json_encode($value){
    if (version_compare(PHP_VERSION, '5.4.0') >= 0) {
        $encoded = json_encode($value, JSON_PRETTY_PRINT);
    } else {
        $encoded = json_encode($value);
    }
    switch (json_last_error()) {
        case JSON_ERROR_NONE:
            return $encoded;
        case JSON_ERROR_DEPTH:
            return 'Maximum stack depth exceeded'; // or trigger_error() or throw new Exception()
        case JSON_ERROR_STATE_MISMATCH:
            return 'Underflow or the modes mismatch'; // or trigger_error() or throw new Exception()
        case JSON_ERROR_CTRL_CHAR:
            return 'Unexpected control character found';
        case JSON_ERROR_SYNTAX:
            return 'Syntax error, malformed JSON'; // or trigger_error() or throw new Exception()
        case JSON_ERROR_UTF8:
            $clean = utf8ize($value);
            return safe_json_encode($clean);
        default:
            return 'Unknown error'; // or trigger_error() or throw new Exception()

    }
}

function utf8ize($mixed) {
    if (is_array($mixed)) {
        foreach ($mixed as $key => $value) {
            $mixed[$key] = utf8ize($value);
        }
    } else if (is_string ($mixed)) {
        return utf8_encode($mixed);
    }
    return $mixed;
}