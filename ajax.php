<?php

    //$_GET["action"] = 'get_cdek_variants';
    //$_GET["country"] = 'ru';
    //$_GET["city_id"] = 195707979;

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
	    $c = htmlspecialchars(stripslashes(trim($_GET["country"])));
	    $i = (int)$_GET["city_id"];
	    echo json_encode(get_cdek_variants($c, $i));
	    break;
    };

    die();

    function get_city(string $country, string $search ) : array {
	$result = [];
	if (($country !== 'ru') && ($country !== 'by')) { return $result; }
	if ((mb_strlen($search) < 3) || (mb_strlen($search) > 15 )) { return $result;}
	$host = 'localhost'; //имя хоста, на локальном компьютере это localhost
	$user = 'grabber'; //имя пользователя, по умолчанию это root
        $password = 'grabpass'; //пароль, по умолчанию пустой
	$db_name = 'geobazar'; //имя базы данных
	//Соединяемся с базой данных используя наши доступы:
	$link = mysqli_connect($host, $user, $password, $db_name);
	mysqli_query($link, "SET NAMES utf8 COLLATE utf8_unicode_ci");

	$q = "select id,pref,name,addinfo from geodata_{$country} where name like '%{$search}%'";
	if ($sqlres = mysqli_query($link, $q)) {
	    while ($row  = mysqli_fetch_row($sqlres)) {$result[] = $row; }
	} else { 
    	    return $result;
	}
	return $result;
    }
    
    function get_cdek_variants(string $country, int $city_id): array {
	$reciever_id = get_cdek_cityid($country, $city_id);
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

    function get_cdek_cityid(string $country, int $city_id): int {
	// Возвращает код населенного пункта в системе CDEK
	$result = 0;
	if (($country !== 'ru') && ($country !== 'by')) { return $result; }
	$host = 'localhost'; //имя хоста, на локальном компьютере это localhost
	$user = 'grabber'; //имя пользователя, по умолчанию это root
        $password = 'grabpass'; //пароль, по умолчанию пустой
	$db_name = 'geobazar'; //имя базы данных
	//Соединяемся с базой данных используя наши доступы:
	$link = mysqli_connect($host, $user, $password, $db_name);
	mysqli_query($link, "SET NAMES utf8 COLLATE utf8_unicode_ci");
	if ($sqlres = mysqli_query($link, "select id,pref,name,addinfo from geodata_{$country} where id={$city_id}")) {
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
	return "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZSI6WyJvcmRlcjphbGwiLCJwYXltZW50OmFsbCJdLCJleHAiOjE2NDUzOTQzMzksImF1dGhvcml0aWVzIjpbInNoYXJkLWlkOnJ1LTAxIiwiZnVsbC1uYW1lOtCi0LXRgdGC0LjRgNC-0LLQsNC90LjQtSDQmNC90YLQtdCz0YDQsNGG0LjQuCDQmNCcLCDQntCR0KnQldCh0KLQktCeINChINCe0JPQoNCQ0J3QmNCn0JXQndCd0J7QmSDQntCi0JLQldCi0KHQotCS0JXQndCd0J7QodCi0KzQriIsImNvbnRyYWN0OtCY0Jwt0KDQpC3Qk9Cb0JMtMjIiLCJhY2NvdW50LWxhbmc6cnVzIiwiYXBpLXZlcnNpb246MS4xIiwiYWNjb3VudC11dWlkOmU5MjViZDBmLTA1YTYtNGM1Ni1iNzM3LTRiOTljMTRmNjY5YSIsImNsaWVudC1pZC1lYzU6ZWQ3NWVjZjQtMzBlZC00MTUzLWFmZTktZWI4MGJiNTEyZjIyIiwiY2xpZW50LWlkLWVjNDoxNDM0ODIzMSIsInNvbGlkLWFkZHJlc3M6ZmFsc2UiLCJjb250cmFnZW50LXV1aWQ6ZWQ3NWVjZjQtMzBlZC00MTUzLWFmZTktZWI4MGJiNTEyZjIyIiwiY2xpZW50LWNpdHk60J3QvtCy0L7RgdC40LHQuNGA0YHQuiwg0J3QvtCy0L7RgdC40LHQuNGA0YHQutCw0Y8g0L7QsdC7LiJdLCJqdGkiOiJkZjQ3YzUwNC1iNDE2LTQxZjUtOWRlMi05YTg0MGVkNWU5ZjAiLCJjbGllbnRfaWQiOiJFTXNjZDZyOUpuRmlRM2JMb3lqSlk2ZU03OEpySmNlSSJ9.Pa63JUihZQx8oV6pZC0GJ78J_Sd9CIQdWTaYRFwsLngkJYAFFcAl7Ja3aUziyA1xUcsAh51fthljtdEvZcnvNXTvd0KDklWgKf2QEzPrkqSNLxGhuMbn8CFVgqxWsYa6q_tw8uyvNQIytQl9wFChH-tMNQ5wgmk6fsmdX8yzstZpEQcuaRBwOet8lojJrkrIgAWcVNwaOB-3aXomz1YqZC5wajaK8ROOQY-DUj2yleq68pPnzstyaGjuFewckv0i4vV9zivP0Zs2tPfvmHIhgwwM139ZVWAvFHegXJZOmNKGwtTg7faNux0RIzb-ulIV1o6Xhma7aFPl9tRUw6iPDQ";
    }
    
    function post_data(string $url, array $data) {
    	$data_string = json_encode($data);                                                                                   
        $ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
	                                    'Content-Type: application/json',
	                                    'Authorization: Bearer '.get_cdek_bearer()) 
	                                    );
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
    }


?>