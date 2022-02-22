<?php
require("conf.php");
$link = mysqli_connect($host, $user, $password, $db_name);
mysqli_query($link, "SET NAMES utf8 COLLATE utf8_unicode_ci");

if (!isset($_GET["action"])) {
	die();
};
$action = htmlspecialchars(stripslashes(trim($_GET["action"])));

switch ($action) {
	case "get_city": 
	    $c = htmlspecialchars(stripslashes(trim($_GET["country"])));
	    $s = htmlspecialchars(stripslashes(trim($_GET["search"])));    
	    echo json_encode(get_city($c, $s));
	    break;
	case "get_cdek_variants": 
	    $i = (int)$_GET["city_id"];
	    echo json_encode(get_cdek_variants($i));
	    break;
    };

    die();

function get_city(string $country, string $search ) : array {
	global $link;
	$result = [];
	if (($country !== 'ru') && ($country !== 'by')) { return $result; }
	if ((mb_strlen($search) < 3) || (mb_strlen($search) > 15 )) { return $result;}
	$q = "select `id`,`pref`,`name`,`addinfo` from geodata where `name` like '%{$search}%' and `ccode`='{$country}'";
	if ($sqlres = mysqli_query($link, $q)) {
	    while ($row  = mysqli_fetch_row($sqlres)) {$result[] = $row; }
	} else { 
   	    return $result;
	}
	return $result;
}
    
function get_cdek_variants(int $city_id): array {
	$reciever_id = get_cdek_cityid($city_id);
	$result = [];
	if ($reciever_id === 0) { return $result;}
	$req = [
	    "type" => 1,
	    "currency" => 1,
	    "lang" => "rus",
	    "from_location" => [
		"code" => 5624		//Брест
	    ],
	    "to_location" => [
		"code" => $reciever_id
	    ],
	    "packages" => [
		[
        	    "height" => 10,
        	    "length" => 10,
        	    "weight" => 300,
        	    "width" => 10
		]
	    ]
	];

	$found = post_data("https://api.edu.cdek.ru/v2/calculator/tarifflist", $req);

	if (count($found) > 0) {
	    foreach ($found["tariff_codes"] as $tariff) {
		$dm = (int)($tariff["delivery_mode"]);
		if ($dm == 3 || $dm == 4 || $dm == 7) {
		    $result[] = [
			"code" => $tariff["tariff_code"],
			"name" => $tariff["tariff_name"],
			"cost" => $tariff["delivery_sum"],
			"time" => $tariff["period_min"]."-".$tariff["period_max"]
		    ];
		}
	    }
	}
	return $result;
}

function get_cdek_cityid(int $city_id): int {
	// Возвращает код населенного пункта в системе CDEK
	//global $host, $user, $password, $db_name;
	global $link;
	$result = 0;
	//if (($country !== 'ru') && ($country !== 'by')) { return $result; }
	//Соединяемся с базой данных 
	//$link = mysqli_connect($host, $user, $password, $db_name);
	//mysqli_query($link, "SET NAMES utf8 COLLATE utf8_unicode_ci");
	if ($sqlres = mysqli_query($link, "select id, pref, name, addinfo from geodata where id={$city_id}")) {
	    if (! $row  = mysqli_fetch_row($sqlres)) { return $result; }
	} else { return $result; }
	// если пришли сюда, значит есть параметры населенного пункта
	$result = get_data("https://api.edu.cdek.ru/v2/location/cities?".http_build_query(["city" => $row[2]]));
	foreach($result as $found) {
	    $r = mb_split(" ",$found["region"]);
	    array_unshift($r, array_pop($r));
	    $found["region"] = implode(" ",$r);
	    if (mb_strpos($row[3], $found["region"]) === false) { continue; }
	    return (int)$found["code"];
	}
	return 0;
}
    
function get_cdek_bearer(): string {
	global $link;
	if ($sqlres = mysqli_query($link, "select conf.value as client_id,
											  conf2.value as client_password, 
											  conf3.value as bearer, 
											  conf4.value as valid_until 
										from `e13_config` as conf 
										join `e13_config` as conf2 on conf2.id=2
										join `e13_config` as conf3  on conf3.id=3
										join `e13_config` as conf4  on conf4.id=4
										WHERE conf.id=1")) {
	    if (! $row  = mysqli_fetch_row($sqlres)) { return "Error BD"; }
		// Если пришли сюда, значит есть результат чтения из БД
		$valid_until = (int)$row[3];
		if ( time() < $valid_until ) {
			// Токен еще не протух, возвращаем его
			return $row[2];
		} else {
			// Нужно запросить новый токен 
			$post_data = ['grant_type' => 'client_credentials',
						 'client_id' => 'EMscd6r9JnFiQ3bLoyjJY6eM78JrJceI',
						 'client_secret' => 'PjLZkKBHEiLK3YsjtNrt3TGNG0ahs3kG'];
			// и записать его в базу
			$new_bearer = post_data("https://api.edu.cdek.ru/v2/oauth/token?parameters", $post_data);
			if (! isset($new_bearer["access_token"])) {
				return "error reading token";
			} else { 
				$bearer = $new_bearer["access_token"];
				$valid_until = time() + (int)$new_bearer["expires_in"];
				mysqli_query($link, "update `e13_config` set `value` = '{$bearer}' where id = 3;");
				mysqli_query($link, "update `e13_config` set `value` = '{$valid_until}' where id = 4;");
				return $bearer;
			}
		}
	}
	return "error unknown"; 
}
    
function post_data(string $url, array $data) {
    $ch = curl_init();
	if ($url !== "https://api.edu.cdek.ru/v2/oauth/token?parameters") { 
		$hdr = ['Content-Type: application/json'];
		$hdr[] = 'Authorization: Bearer '.get_cdek_bearer(); 
		$data_string = json_encode($data);                                                                                   
	} else {
		$hdr = ['Content-Type: application/x-www-form-urlencoded'];
		$data_string = http_build_query($data);
	}
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $hdr);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
	$result = curl_exec($ch);
	curl_close($ch); 
	return json_decode($result, true);
}

function get_data(string $url) {
    $ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
	                                    'Accept: application/json',
	                                    'Authorization: Bearer '.get_cdek_bearer())
	                                    );
	$result = curl_exec($ch);
	curl_close($ch); 
	return json_decode($result, true);
}?>