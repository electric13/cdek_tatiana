<?php
    $letters = mb_str_split('абвгдеёжзийклмнопрстуфхцчшщьыъэюя');
    //$letters = array('');

    $host = 'localhost'; //имя хоста, на локальном компьютере это localhost
    $user = 'grabber'; //имя пользователя, по умолчанию это root
    $password = 'grabpass'; //пароль, по умолчанию пустой
    $db_name = 'geobazar'; //имя базы данных
    define('MAX_PUSH', 2000);
    //Соединяемся с базой данных используя наши доступы:
    $link = mysqli_connect($host, $user, $password, $db_name);
    mysqli_query($link, "SET NAMES utf8 COLLATE utf8_unicode_ci");

    
    for ($i = 0; $i < count($letters); $i++) {
	$ctr = 0;
	$q = "REPLACE INTO geodata_ru (id, pref, name, addinfo) values ";
	$req = "https://belbazar24.by/ajax.php?action=get_city&country=ru&search=".$letters[$i];
	$data = json_decode(file_get_contents($req));
	$total = count($data);
	echo "total {$total} records found. Begin!\n";
	for ($j = 0; $j < $total; $j++) {
	    $point = $data[$j];
	    if ((int)$point[0] === 0) {
		echo "Error: record $point[0]\n";
		$l = mb_str_split($point[0]);
		$point[0] = '';
		foreach($l as $symb) {
		    switch($symb) {
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9': $point[0] .= $symb;
		    }
		}
		$point[0] = (int)$point[0];
		echo "recovered: {$point[0]}\n";
	    };
	    $point[0] = (int) $point[0];
    	    $q .= "({$point[0]},'{$point[1]}','{$point[2]}','{$point[3]}'),";
	    if (++$ctr > MAX_PUSH - 1) {
		$q = mb_substr($q, 0, -1);
        	    if (!mysqli_query($link, $q)) {
			echo "Error!\n";
			echo $q."\n";
			die;
    		    }
		$q = "REPLACE INTO geodata_ru (id, pref, name, addinfo) values ";
		echo "{$ctr}({$j}th) of {$total} records pushed\n";
		$ctr = 0;
	    }
	}
	if ($ctr > 0) {
	    $q = mb_substr($q, 0, -1);
	    if (!mysqli_query($link, $q)) {
		echo "Error!\n";
	        echo $q."\n";
    	    }
	    echo "{$ctr} records pushed\n";
	}
    }
?>