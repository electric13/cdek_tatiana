var check_basket_parametr = new Array();

// Навешиваем события на элементы
jQuery(document).ready(function($){
	// Check box (галочка)
	$('[id*=check_]').click(function() {
		var obj = $(this).parent().find('label');
		if ($(obj).hasClass('filtr_label_active'))
		{
			$(obj).removeClass('filtr_label_active');
		}
		else
		{
			$(obj).addClass('filtr_label_active');
		}
	});
	
	// Radio button
	$('[id*=radio_]').click(function() {
		id = $(this).attr('id');
		id = id.split('_');
		$('[id*=radio_' + id[1] + '_]').each(function() {
			var obj = $(this).parent().find('label');
			if ($(obj).hasClass('radio_label_active')) $(obj).removeClass('radio_label_active');
		});
		
		$(this).parent().find('label').addClass('radio_label_active');
	});
	
	// Пересчет корзины
	$("input[id*=count_]").keyup(function(event){
		if (this.value)
		{
			count = parseInt(this.value,10);
			$(this).val(count);
			calculate_basket();
		}
	});
	
	$("input[id*=count_]").blur( function(){
		if ( this.value == '' )	this.value = '0';
		calculate_basket();
	});
	
	// Элемент select
	$('.form_select select').change(function(){
		value = $(this).val();
		id = $(this).attr('id');
		name = $(this).attr('name');
		if (value == 'else' && $(this).hasClass('phone_code'))
		{
			inner_html = '<div class="form_select_plus">+</div><div class="form_select_pole"><input type="text"';
			if (name != 'undefined') inner_html = inner_html + ' name="' + name + '"';
			if (id != 'undefined') inner_html = inner_html + ' id="' + id + '"';
			inner_html = inner_html + ' value="" /></div><div class="clear"></div>';
			$(this).parent().parent().html(inner_html);
		}
		else
		{
			text = $(this).find('option:selected').html();
			$(this).parent().find('div').html(text);
		}
	});
	
	// Числовые поля
	$(".int_val").keyup(function(event){
		if (this.value)
		{
			count = parseInt(this.value,10);
			$(this).val(count);
		}
	});
	
	$(".int_val").blur( function(){
		if ( this.value == '' )	this.value = '0';
	});
	
	// Кнопка переключения отзывов и вопросов
	$('.reviews_top_item').click(function() {
		id = $(this).attr('id');
		id = id.split('_');
		$('.reviews_top_item').removeClass('active');
		$(this).addClass('active');
		$("[id*=button_]").hide();
		$('#button_' + id[1]).show();
		$('.product_form').hide();
		$("[id*=list_]").hide();
		// if ($('#list_' + id[1]).hasClass('no')) $('.product_form.' + id[1]).show();
			// else $('#list_' + id[1]).show();
		$('#list_' + id[1]).show();
	});
	
	// Загрузка файлов через Ajax
	$('.mult_files').change(function(){
		upload_data(this);
	});
	
	// Загрузка файлов через Ajax
	$('.another_pic').change(function(){
		upload_another_pic(this);
	});
	
	$('#city_pole').keyup(function(){
		show_city_variant();
	});
	
	// Скрывает подсказку по городам
	$('body').on('click', function(event){
		$obj = $('.city_pole_box');
		$target = $(event.target);
		
		//если кликнули в любом другом месте, вне меню - скрываем его
		if (!$obj.find($target).length) $('.basket_variant_list').hide();
	});
	
	$('#city_pole').focus(function(){
		show_city_variant();
	});
	
	// Чекбоксы в корзине
	$('[id*=basket_check_]').change(function(){
		id = $(this).attr('id');
		id = id.split('_');
		id = id[2];
		
		if (id == 'all')
		{
			if ($(this).is(':checked'))
			{
				$('[id*=basket_check_]').prop('checked', true);
				$('[id*=basket_check_]').parent().find('label').addClass('filtr_label_active');
			}
			else
			{
				$('[id*=basket_check_]').prop('checked', false);
				$('[id*=basket_check_]').parent().find('label').removeClass('filtr_label_active');
			}
		}
		else
		{	
			is_all = 'yes';
			av = $('[id*=basket_check_]');
			for (e = 0; e < av.length; e++)
			{
				id = $(av[e]).attr('id');
				id = id.split('_');
				id = id[2];
				
				if (!$(av[e]).is(':checked') && id != 'all') is_all = 'no';
			}
			
			if (is_all == 'yes')
			{
				$('#basket_check_all').prop('checked', true);
				$('#basket_check_all').parent().find('label').addClass('filtr_label_active');
			}
			else
			{
				$('#basket_check_all').prop('checked', false);
				$('#basket_check_all').parent().find('label').removeClass('filtr_label_active');
			}
		}
		
		list_to_order = '';
		av = $('[id*=basket_check_]');
		for (e = 0; e < av.length; e++)
		{
			id = $(av[e]).attr('id');
			id = id.split('_');
			id = id[2];
			
			if ($(av[e]).is(':checked') && id != 'all')
			{
				if (list_to_order) list_to_order = list_to_order + ':';
				list_to_order = list_to_order + id;
			}
		}
		
		today = new Date().getTime() + 60*60*24*31*12;
		setCookie('list_to_order', list_to_order, new Date(today), "/");
		
		calculate_basket();
	});
	
	// Показывает нужную статью в drop списке
	$('.drop_item').click(function() {
		$('.drop_item').removeClass('active');
		$(this).addClass('active');
	});
	
	//Кнопка наверх сайта
	$(window).scroll(function() {
		w = $(window).width();
		if (w > 1000)
		{
			if ($(this).scrollTop() > 400) { 
				$('.back_to_top').fadeIn();
			} else {
				$('.back_to_top').fadeOut();
			}
		}
	});
	$('.back_to_top').click(function() {
		$('body,html').animate({
			scrollTop: 0
		}, 800);
		return false;
	});
})

// Функция для отправки формы
var is_submit = 'no';
function submit_form(id)
{
	if (is_submit == 'no')
	{
		is_submit = 'yes';
		$('#' + id + '_form').find('div:first').html('<input type="hidden" name="sendform" value="'+id+'" />');
		$('#' + id + '_form').submit();
	}
	return false;
}

// Ставит автоматом на все ссылки blur()
function externalLinks()
{
	if (!document.getElementsByTagName) return;
	var anchors = document.links;
	for (var i=0; i < anchors.length; i++)
		anchors[i].onfocus = function(e){this.blur();}
}

// Фильтрация ввода в поля
function check_key(obj)
{
	$(obj).keypress(function(event){
		var key, keyChar;
		if(!event) var event = window.event;
		
		if (event.keyCode) key = event.keyCode;
		else if(event.which) key = event.which;	
		
	
		if(key==null || key==0 || key==8 || key==13 || key==9 || key==46 || key==39 ) return true;
				
		keyChar=String.fromCharCode(key);
		
		if(!/\d/.test(keyChar))	return false;
	});
}

// Задает значение в Cookie
function setCookie (name, value, expires, path, domain, secure)
{
  document.cookie = name + "=" + escape(value) +
    ((expires) ? "; expires=" + expires : "") +
    ((path) ? "; path=" + path : "") +
    ((domain) ? "; domain=" + domain : "") +
    ((secure) ? "; secure" : "");
}

// Получает значение Cookie
function getCookie(name)
{
	var cookie = " " + document.cookie;
	var search = " " + name + "=";
	var setStr = null;
	var offset = 0;
	var end = 0;
	if (cookie.length > 0)
	{
		offset = cookie.indexOf(search);
		if (offset != -1)
		{
			offset += search.length;
			end = cookie.indexOf(";", offset)
			if (end == -1) end = cookie.length;
			setStr = unescape(cookie.substring(offset, end));
		}
	}
	return(setStr);
}

// Возвращает первую позицию элемента в строке
function strpos(haystack, needle, offset)
{
	var i = haystack.indexOf(needle, offset);
	return i >= 0 ? i : false;
}

// Standart string replace functionality
function str_replace(haystack, needle, replacement) {
	var temp = haystack.split(needle);
	return temp.join(replacement);
}

// Needle may be a regular expression
function str_replace_reg(haystack, needle, replacement) {
	var r = new RegExp(needle, 'g');
	return haystack.replace(r, replacement);
}

// Функция отслеживания нажатие Enter
function check_enter(obj)
{
	$(obj).keypress(function(event){
		var key, keyChar;
		if(!event) var event = window.event;
		
		if (event.keyCode) key = event.keyCode;
		else if(event.which) key = event.which;	
		
		if (key == 13)
		{
			id = $(this).parents('form').prop('id');
			id = id.replace('_form', '');
			submit_form(id);
			return false;
		}
	});
}

// Делает редирект
function redirect(url)
{
	window.location.href = url;
	return false;
}

function show_message(status, title, text)
{
	$.modal.close();
	$('#message_text').html(text);
	$('#message').modal({overlayClose: true});
	if (status == 'good') setTimeout("$.modal.close()", 4000);
	
	$('.message_buttons').hide();
	if (status == 'basket') $('.message_buttons').show();
	
	return false;
}

function show_object(id)
{
	$.modal.close();
	$('#'+id).modal({overlayClose: true});
	return false;
}

// Возвращает цифру, разделенную по 1000
function divided_by_3(num)
{
	result = '';
	d = num % 1000;
	num = num/1000 >> 0;
	while( num > 0 )
	{
		result = d + result;
		if( d < 100 ) result = '0' + result;
		if( d < 10 ) result = '0' + result;
		result = " " + result;
		d = num % 1000;
		num = num/1000 >> 0;
	}
	result = d + result;
	return result;
}

// Делает красивыми цены
function good_price(obj)
{	
	$(obj).each(function(){
		$(this).text(divided_by_3(str_replace($(this).text(), ' ', '')));
	});
}

// Галерея слайдеров на главной
function change_slider(action)
{
	if (action == 'left' || action == 'right') clearInterval(timerId);
	now_slider = slide_number;
	if (action == 'left') slide_number = slide_number - 1;
		else slide_number = slide_number + 1;
	if (slide_number == 0) slide_number = max_slider;
	if (slide_number == max_slider + 1) slide_number = 1;
	x = $('#visual_' + slide_number).get(0).outerHTML;
	$('#visual_' + slide_number).remove();
	$(".visual_box").prepend(x);
	$('#visual_' + slide_number).css('position', 'absolute');
	$('#visual_' + now_slider).fadeOut(500);
	$('#visual_' + slide_number).fadeIn(500, function() {
		$('#visual_' + slide_number).css('position', 'static');
	});
	return false;
}

// Сохраняет (курсы валют, сортировку, кол-во вывода)
function save(val, type)
{
	$('#actual_'+type).val(val);
	submit_form(type);
	return false;
}

// Обновляет информацию по фильтру
function update_filtr(url_describe) 
{	
	$('#pjax_hover').show();

	var form = $("#filtr_form");
	data = form.serialize();

	$.pjax({
		url: url_describe,
		timeout    : 5000,
		container  : '.content',
		fragment   : '.content',
		data       : data,
		push       : true,
		replace    : false,
		"scrollTo" : false
	});

	$(document).on('pjax:complete', function() {
		$('#pjax_hover').hide();
	});
}

function check_one(id, act) {
	val = $('#page_check_par_' + id).val();
	val = Number(val);
	if (act == 'plus') val = val + 1;
	if (act == 'minus' && val > 0) val = val - 1;
	$('#page_check_par_' + id).val(val);
}

// Отмечает параметр
function check_parametr(id, price, place)
{
	if (typeof check_basket_parametr[id] === "undefined") check_basket_parametr[id] = '';
	if (check_basket_parametr[id] != '') check_basket_parametr[id] = '';
		else check_basket_parametr[id] = price;
	$('#' + place + '_check_par_' + id).removeClass('check');
	if (check_basket_parametr[id] != '') $('#' + place + '_check_par_' + id).addClass('check');
	return false;
}

// Обработка размеров
function pre_add_to_basket(id, action, place)
{
	var x, y;
	a = 1; // метка
	
	if (action == 'one')
	{
		for (var key in check_basket_parametr)
			if (check_basket_parametr[key] != '')
			{
				add_to_basket(id, check_basket_parametr[key], key, 1);
				check_basket_parametr[key] = '';
				$('#' + place + '_check_par_' + key).removeClass('check');
				a = 2;
			}
		
		if (a == 1)
		{
			if (place == 'modal') show_message('', '', 'Выберите размер.');
				else show_razmer(id);
		}
		// if (a == 1) show_message('', '', 'Выберите размер.');
	}
	
	if (action == 'two')
	{
		for (var key_one in check_basket_parametr)
			if (check_basket_parametr[key_one] != '')
			{
				x = key_one.split('-');
				if (x[0] != '')
				{
					for (var key_two in check_basket_parametr)
						if (check_basket_parametr[key_two] != '')
						{	
							y = key_two.split('-');
							if (y[1] != '')
							{
								key = x[0] + '-' + y[1];
								add_to_basket(id, check_basket_parametr[key_two], key, 1);
								a = 2;
							}
						}
				}
			}
		
		if (a == 2)
		{
			for (var key in check_basket_parametr)
				check_basket_parametr[key] = '';
			$('[id*=' + place + '_check_par_]').removeClass('check');
		}
		else
		{
			if (place == 'modal') show_message('', '', 'Выберите размер и рост.');
				else show_razmer(id);
		}
		// else show_message('', '', 'Выберите параметры.');
	}
	
	return false;
}

// Сохраняем корзину
function set_basket(basket)
{
   $.get(
		'/geobazar/ajax.php',
		{action:'set_basket', basket:basket},
		function(data){
			return data;
		}
	);
}

// Добавляет продукт в корзину
function add_to_basket(id, price, parametr, count)
{
	var x, y;
	count = Number(count);
	
	list_to_order = getCookie('list_to_order');
	
	x = strpos(' ' + basket, ',' + id + ':' + parametr + ':');
	if (!x)
	{
		basket = basket + ',' + id + ':' + parametr + ':' + count + ':' + price + ';';
		basket_count = basket_count + count;
		basket_price = basket_price + count * Math.round(price * kurs * sale_prefix);
		
		if (list_to_order) list_to_order = list_to_order + ':';
		list_to_order = list_to_order + id;
	}
	else
	{
		basket = basket.split(';');
		b_count = basket.length;
		new_basket = '';
		for (y=0; y<b_count; y++)
			if (basket[y] != '')
			{
				x = strpos(' ' + basket[y], ',' + id + ':' + parametr + ':');
				if (x)
				{
					list = basket[y].split(':');
					list[2] = Number(list[2]);
					list[2] = list[2] + count;
					new_basket = new_basket + list[0] + ':' + list[1] + ':' + list[2] + ':' + price + ';';
					basket_count = basket_count + count;
					basket_price = basket_price + count * Math.round(price * kurs * sale_prefix);
				}
				else new_basket = new_basket + basket[y] + ';';
			}
		basket = new_basket;
	}
	
	set_basket(basket);
	
	today = new Date().getTime() + 60*60*24*31*12;
	setCookie('list_to_order', list_to_order, new Date(today), "/");
	
	$('#b_count').html(basket_count);
	$('#b_price').html(basket_price);
	good_price('.price');
	
	if (basket_count > 0) $('#b_count').removeClass('display_none');
		else $('#b_count').addClass('display_none');
	
	add_mess = 'Товар успешно добавлен в корзину.';
	show_message('basket', '', add_mess);
	
	setgoal('add_cart');

	return false;
}

// Удаляет продукт из корзины
function delete_from_basket(id)
{
	basket = basket.split(';');
	b_count = basket.length;
	new_basket = '';
	for (y=0; y<b_count; y++)
		if (basket[y] != '')
		{
			x = strpos(' ' + basket[y], ',' + id + ':');
			if (x)
			{
				list = basket[y].split(':');
				list[0] = str_replace(list[0], ',', '');
				$('#tr_'+list[0]).remove();
			}
			else new_basket = new_basket + basket[y] + ';';
		}
	basket = new_basket;
	
	set_basket(basket);
	
	if (basket == '')
	{
		$('#basket_list').hide();
		$('#basket_disable').show();
	}
	
	calculate_basket();
	
	add_mess = 'Товар удален из корзины.';
	show_message('', '', add_mess);

	return false;
}

// Удаляет все товары из корзины
function delete_all_basket()
{
	basket = '';
	
	set_basket(basket);
	
	$('#basket_list').hide();
	$('#basket_disable').show();
	
	calculate_basket();
	
	add_mess = 'Все товары удалены из корзины.';
	show_message('', '', add_mess);

	return false;
}

// Пересчитывает корзину
function calculate_basket()
{
	basket_count = 0;
	basket_price = 0;
	promo_price = 0;
	sale_summa = 0;
	new_basket = '';
	economia = 0;
	show_price = 0;
	show_count = 0;
	$('[id*=summa_]').html('0');
	
	show_count_old = $('#all_count').text();
	show_count_old = Number(show_count_old);
	
	list_to_order = getCookie('list_to_order');
	
	if (basket)
	{
		basket = basket.split(';');
		b_count = basket.length;
		
		$('input[id*=count_]').each(function() {
			count = $(this).val();
			count = Number(count);
			
			console.log(count);
			
			s_id = $(this).attr("id");
			s_id = s_id.split('_');
			
			for (y=0; y<b_count; y++)
				if (basket[y] != '')
				{
					x = strpos(' ' + basket[y], ',' + s_id[1] + ':' + s_id[2] + ':');
					if (x)
					{
						list = basket[y].split(':');
						new_basket = new_basket + list[0] + ':' + list[1] + ':' + count + ':' + list[3] + ';';
						basket_count = basket_count + count;
						summa = Math.round(Number(list[3]) * kurs) * count;
						basket_price = basket_price + summa;
						list[0] = str_replace(list[0], ',', '');
						
						if (strpos(' :' + list_to_order + ':', ':' + list[0] + ':'))
						{
							real_summa = Math.round(Number(list[3]) * kurs * sale_prefix) * count;
							sale_summa = sale_summa + summa - real_summa;
							show_price = show_price + real_summa;
							show_count = show_count + count;
							if (special_offer_list[Number(list[0])] == 'yes') promo_price = promo_price + real_summa;
							if (sale_product_arr[list[0]]) economia = economia + (sale_product_arr[list[0]] - Math.round(Number(list[3]) * kurs)) * count;
						}
						
						val = $('#summa_'+list[0]).html();
						val = str_replace(val, ' ', '');
						val = Number(val) + summa;
						$('#summa_'+list[0]).html(val);
						$('#summa_'+list[0] + '_mob').html(val);
					}
				}
		});
	}
	
	basket = new_basket;
	
	set_basket(basket);
	
	show_delivery();
	
	$('#b_count').html(basket_count);
	$('#b_price').html(basket_price);
	
	$('#all_count').html(show_count);
	$('#sale_summa').html(sale_summa);
	
	if (promo_percent > 0)
	{
		promo_summa = Math.round(promo_price * promo_percent / 100);
		$('#promo_summa').html(promo_summa);
		show_price = show_price - promo_summa;
		
		if (promo_summa) $('.b_all_text_econom.promo').show();
			else $('.b_all_text_econom.promo').hide();
	}
	
	if (economia > 0)
	{
		$('#economia').html(economia);
		$('#economia').parent().parent().show();
	}
	else $('#economia').parent().parent().hide();
	
	$('#all_price').html(show_price);
	good_price('.price');
	
	if (basket_count > 0) $('#b_count').removeClass('display_none');
		else $('#b_count').addClass('display_none');
	
	// if ((show_count_old >= opt_count && show_count < opt_count) || (show_count_old < opt_count && show_count >= opt_count)) location.reload();
	// if (show_count_old >= opt_count && show_count < opt_count) location.reload();
	
	return false;
}

// Переключает страну в корзине
function show_country(country_id)
{
	$('[id*=b_country_]').removeClass('vkladka_active');
	$('#b_country_' + country_id).addClass('vkladka_active');
	
	$('#adress_country').val(country_id);
	
	reset_city();
	
	return false;
}

// + - в корзине
function basket_up(id, action)
{
	count = $('#' + id).val();
	count = Number(count);
	if (action == 'plus') count = count + 1;
	if (action == 'minus' && count > 0) count = count - 1;
	$('#' + id).val(count);
	calculate_basket();
	return false;
}

// Переключение вкладок в отзывах
function show_reviews(action)
{
	$('.tab_link').removeClass('active');
	$('.tab_link.' + action).addClass('active');
	$('[id*=tab_]').hide();
	$('#tab_' + action).show();
	$('#city_pole').val('');
	
	return false;
}

// Добавляет в избранное
function add_to_favorites(id)
{
	$('#favorite_id').val(id);
	submit_form('favorites');
	return false;
}

// Удаляет из избранного
function delete_favorites(id)
{
	$('#favorite_id').val(id);
	submit_form('fav_delete');
	return false;
}

// Работа с избранным по ajax
var is_send_favorite = 'no';
function check_favorites(obj, type, id)
{
	if (is_send_favorite == 'no')
	{
		is_send_favorite = 'yes';
		if (is_user_auth)
		{
			$.get(
				'/geobazar/ajax.php',
				{action:'set_favorite', id:id},
				function(data){
					if (data != 'error')
					{
						fav_count = $('#fav_count').html();
						fav_count = Number(fav_count);
						
						if (data == 'add')
						{
							$(obj).addClass('active');
							
							// Страница продукта
							if (type == 'one_product')
							{
								$(obj).text('В избранном');
							}
							
							// Корзина
							if (type == 'basket')
							{
								$(obj).html('<span>В избранном</span>');
							}
							
							fav_count = fav_count + 1;
						}
						
						if (data == 'delete')
						{
							$(obj).removeClass('active');
							
							// Страница продукта
							if (type == 'one_product')
							{
								$(obj).text('Добавить в избранное');
							}
							
							// Корзина
							if (type == 'basket')
							{
								$(obj).html('<span>В избранное</span>');
							}
							
							fav_count = fav_count - 1;
						}
						
						$('#fav_count').html(fav_count);
						if (fav_count) $('#fav_count').show();
							else $('#fav_count').hide();
					}
					else show_message('error', 'Ошибка!', 'Неизвестная ошибка. Обратитесь к Администратору.');
					
					is_send_favorite = 'no';
				}
			);
		}
		else show_object('auth');
	}
	return false;
}

// Показывает / скрывает меню в моб. версии
function toggle_mobile_menu()
{
	$('#mobile_menu').toggle();
	return false;
}

// Показывает актуальный блок продуктов на главной
function show_sblock(type)
{
	$('[class*=s_list_button_]').removeClass('active');
	$('.s_list_button_' + type).addClass('active');
	$('[id*=sblock_]').hide();
	$('#sblock_' + type).show();
	return false;
}

// Показывает / скрывает фильтр в каталоге
function show_filtr()
{
	$('.cl_mob_categories').hide();
	if ($('.content_left').hasClass('show')) $('.content_left').removeClass('show');
		else $('.content_left').addClass('show');
}

// Показывает вкладку на главной
function show_special(act)
{
	$('.sp_spec_item').removeClass('active');
	$('.sp_spec_item.' + act).addClass('active');
	$('.sp_spec_list_box').addClass('hide');
	$('.sp_spec_list_box.' + act).removeClass('hide');
}

// Показывает / скрывает фильтр в каталоге
function show_mob_categories()
{
	$('.cl_mob_categories').toggle();
	$('.content_left').removeClass('show');
}

// Купить в 1 клик
function by_one_click(action)
{
	one_click_list = '';
	
	if (action == 'one' || action == 'one_add_order')
	{
		a = 1; // метка
		
		list = $('[id*=page_check_par_]');
		for (key=0; key<list.length; key++)
		{
			if ($(list[key]).hasClass('check'))
			{
				par = $(list[key]).attr('id')
				par = par.split('_');
				if (one_click_list != '') one_click_list = one_click_list + ';';
				one_click_list = one_click_list + par[3] + ':1';
				a = 2;
			}
		}
		
		if (a == 1)
		{
			show_message('', '', 'Выберите размер.');
		}
		else
		{
			if (action == 'one') show_object('one_click');
			if (action == 'one_add_order') show_object('add_to_order');
		}
	}
	
	if (action == 'two' || action == 'two_add_order')
	{
		a_left = 1; // метка
		a_right = 1; // метка
		
		par = '-';
		list = $('[id*=page_check_par_]');
		for (key=0; key<list.length; key++)
		{
			id = $(list[key]).attr('id');
			id = id.split('_');
			id = id[3].split('-');
			if ($(list[key]).hasClass('check'))
			{
				if (id[0])
				{
					par = id[0] + par;
					a_left = 2;
				}
				
				if (id[1])
				{
					par = par + id[1];
					a_right = 2;
				}
			}
		}
		
		if (one_click_list != '') one_click_list = one_click_list + ';';
		one_click_list = one_click_list + par + ':1';
		
		if (a_left == 1 || a_right == 1)
		{
			show_message('', '', 'Выберите размер и рост.');
		}
		else
		{
			if (action == 'two') show_object('one_click');
			if (action == 'two_add_order') show_object('add_to_order');
		}
	}
	
	return false;
}

function submit_one_click()
{
	$('#keys').val(one_click_list);
	$('#one_click_form').attr('action', one_click_url);
	submit_form('one_click'); 
	
	return false;
}

function submit_add_to_order()
{
	val = $('#add_to_order_id').val();
	if (val)
	{
		$('#add_to_order_keys').val(one_click_list);
		$('#add_product_page_form').attr('action', '/profile/orders/?order=' + val);
		submit_form('add_product_page'); 
	}
	else show_message('', '', 'Выберите заказ.');
	
	return false;
}

// Отправляет форму поиска или показывает в моб версии
function check_search()
{
	is_display = $('.f_line_search_input').css('display');
	if (is_display == 'none') $('.f_line_search').addClass('show');
		else submit_form('search');
}

// Производители (сохранение данных)
function save_obj_data(obj, type, pole, id)
{
	$('#pjax_hover').show();
	
	if (type == 'input' || type == 'select' || type == 'textarea') val = $(obj).val();
	if (type == 'checkbox')
	{
		if ($(obj).is(':checked')) val = 'yes';
			else val = 'no';
	}
	
	// Отправляем ajax запрос на сохранение
	$(function(){
		$.get(
			'',
			{action:'save_obj', pole:pole, id:id, value:val},
			function(data){
				$('#pjax_hover').hide();
				
				if (pole == 'manufactura_status' && data != 'error')
				{
					$(obj).parent().parent().find('.manager_td_input').hide();
					$(obj).parent().parent().find('.manager_another_box').hide();
					
					if (val) $('#manager_pole_' + id).css('background', data);
						else $('#manager_pole_' + id).css('background', 'none');
					
					if (val == 'expected') $(obj).parent().parent().find('.manager_td_input').show();
					if (val == 'another_color') $(obj).parent().parent().find('.manager_another_box').show();
				}
				if (data == 'error') show_message('error', 'Ошибка!', 'Неизвестная ошибка. Обратитесь к Администратору.');
			}
		);
	});
}

// Показывает / скрывает блок в фильтре
function show_hide_flitr_block(id)
{
	if ($('#fbox_tltle_' + id).hasClass('active'))
	{
		$('#fbox_tltle_' + id).removeClass('active');
		$('#fbox_' + id).hide();
	}
	else
	{
		$('#fbox_tltle_' + id).addClass('active');
		$('#fbox_' + id).show();
	}
}

// Отправляет sms код
function get_sms_code(act)
{
	$('#auth_error_message').hide();
	var a = 1; // метка
	
	phone_code = $('#auth_phone_code').val();
	phone = $('#auth_phone').val();
	phone_sms_code = $('#auth_sms_code').val();
	
	if (!phone) {mess = 'Введите номер мобильного телефона.'; a = 2;}
	if (a == 1 && act == 'submit' && !phone_sms_code) {mess = 'Введите проверочный код из СМС.'; a = 2;}
	
	if (a == 1)
	{
		$.getJSON(
			'/geobazar/ajax.php',
			{action:'get_sms_code', act:act, phone_code:phone_code, phone:phone, phone_sms_code:phone_sms_code},
			function(data){
				var a = 1; // метка
				
				if (data)
				{
					if (data['status'] == 'good')
					{
						if (act == 'sms')
						{
							$('#code_pole').show();
							$('#auth_button_send').show();
							$('#auth_button_get_code').hide();
						}
						
						if (act == 'submit')
						{
							if (auth_action == 'basket') redirect('/basket/');
								else redirect('/profile/');
						}
					}
					else {error_mess = data['text']; a = 2;}
				}
				else {error_mess = 'Произошла системная ошибка, обратитесь к Администратору.'; a = 2;}
				
				if (a == 2)
				{
					$('#auth_error_message').html(error_mess);
					$('#auth_error_message').show();
				}
			}
		);
	}
	else
	{
		$('#auth_error_message').html(mess);
		$('#auth_error_message').show();
	}
}

// Подгружает новинки на главной странице
var is_load_products = 'no';
function show_new_products()
{
	if (is_load_products == 'no')
	{
		is_load_products = 'yes';
		new_show_page = new_show_page + 1;
		
		var fd = new FormData;
		fd.append('action', 'sp_new_products');
		fd.append('new_show_page', new_show_page);
		
		$.ajax({
			url: '/',
			data: fd,
			processData: false,
			contentType: false,
			type: 'POST',
			success: function (data) {
				if (data) $('#sp_new_product_box').append(data);
					else redirect('/dress/');
				is_load_products = 'no';
			}
		});
	}
}

// ПОказывает нужную форму у продукта
function show_product_form(obj)
{
	id = $(obj).attr('id');
	id = id.split('_');
	$("[id*=list_]").hide();
	$('.product_form').hide();
	$('.product_form.' + id[1]).show();
}

// Прокрутка к нужному объекту
function scroll_to_last_message(obj)
{
	x = $(obj).offset();
	$('body,html').animate({
		scrollTop: x['top']
	}, 800);
}

// Заглушка процесса загрузки
function show_load(txt)
{
	$('#load_bar_text').text(txt);
	$.modal.close();
	$('#load_bar').modal({overlayClose: false});
	return false;
}

// Загрузка файлов
var is_upload = '';
function upload_data(obj)
{
	if (is_upload == '')
	{
		is_upload = 'yes';
		var fd = new FormData;
		
		data = $(obj).prop('files');
		if (data.length > 0)
		{
			show_load('Идет загрузка...');
			
			fd.append('action', 'upload_data');
			for (var key in data)
				fd.append('attach[]', data[key]);
			
			$.ajax({
				url: '/geobazar/ajax.php',
				data: fd,
				processData: false,
				contentType: false,
				type: 'POST',
				success: function (data) {
					$.modal.close();
					data = JSON.parse(data, function (key, value) { return value; });
					
					if (data[0] == 'good')
					{
						id = $(obj).attr('id');
						id = id.split('_');
						
						val = $('.reviews_files_' + id[2]).val();
						if (val)
						{
							val = JSON.parse(val, function (key, value) { return value; });
							list_len = data[1].length;
							val_len = val.length;
							for (i = 0; i < list_len; i++)
							{
								val[val_len] = data[1][i];
								val_len = val_len + 1;
							}
						}
						else val = data[1];
						val = JSON.stringify(val, function (key, value) { return value; });
						$('.reviews_files_' + id[2]).val(val);
						show_files(id[2]);
					}
					else
					{
						show_message('error', 'Загрузка файлов', 'Не удалось закачать файлы. Возможно они превышают допустимый размер или не соответствуют разрешенным расширениям.');
					}
					is_upload = '';
				}
			});
		}
		else is_upload = '';
	}
}

// Загрузка файлов (картинки)
var is_upload = '';
function upload_another_pic(obj)
{
	if (is_upload == '')
	{
		is_upload = 'yes';
		var fd = new FormData;
		
		data = $(obj).prop('files');
		if (data.length > 0)
		{
			show_load('Идет загрузка...');
			
			fd.append('action', 'upload_another_pic');
			for (var key in data)
				fd.append('attach[]', data[key]);
			
			id = $(obj).attr('id');
			id = id.split('_');
			fd.append('id', id[3]);
			fd.append('who', id[0]);
			
			$.ajax({
				url: '/geobazar/ajax.php',
				data: fd,
				processData: false,
				contentType: false,
				type: 'POST',
				success: function (data) {
					$.modal.close();
					data = JSON.parse(data, function (key, value) { return value; });
					
					if (data[0] == 'good')
					{
						$('#another_pic_db_' + id[3]).val(data[1]);
						
						show_another_pics(id[3]);
					}
					else
					{
						show_message('error', 'Загрузка файлов', 'Не удалось закачать файлы. Возможно они превышают допустимый размер или не соответствуют разрешенным расширениям.');
					}
					is_upload = '';
				}
			});
		}
		else is_upload = '';
	}
}

// Показывает картинки в другом цвете (кабинет производителя)
function show_another_pics(id)
{
	val = $('#another_pic_db_' + id).val();
	if (val)
	{
		list = JSON.parse(val, function (key, value) { return value; });
		show_another_pics_recursiv(id, '', list);
	}
	else $('#another_pic_list_' + id).html('').hide();
}

function show_another_pics_recursiv(id, inner_text, list)
{
	var i, pic_number, now, list_len;
	now = new Date();
	pic_number = 'no';
	list_len = list.length;
	for (i = 0; i < list_len; i++)
		if (list[i] != '')
		{
			pic_number = i;
			break;
		}
	
	if (pic_number != 'no')
	{
		$.get(
			'/geobazar/ajax.php',
			{action:'encode_pic_url', url:list[pic_number][0], width:'74', height:'111', action_pic:'cut', time:now},
			function(data){
				inner_text = inner_text + '<div class="another_pic_item">';
				inner_text = inner_text + '	<div class="another_pic_item_close" title="Удалить" onclick="delete_another_pic(' + id + ', ' + pic_number + ');"></div>';
				inner_text = inner_text + '	<a href="' + list[pic_number][0] + '" class="another_pic_item_img" data-lightbox="gallery_another_' + id + '"><img src="' + data + '" alt="" /></a>';
				inner_text = inner_text + '</div>';
				
				list[pic_number] = '';
				show_another_pics_recursiv(id, inner_text, list);
			}
		);
	}
	else
	{
		$('#another_pic_list_' + id).html(inner_text).show();
	}
}

// Удаляет картинку в другом цвете (кабинет производителя)
function delete_another_pic(id, pic_number)
{
	x = confirm('Вы действительно хотите удалить картинку ?');
	if (x)
	{
		list = new Array();
		val = $('#another_pic_db_' + id).val();
		val = JSON.parse(val, function (key, value) { return value; });
		val_len = val.length;
		number = 0;
		for (i = 0; i < val_len; i++)
			if (i != pic_number)
			{
				list[number] = val[i];
				number = number + 1;
			}
		val = JSON.stringify(list, function (key, value) { return value; });
		
		// Заменяем значение
		$('#another_pic_db_' + id).val(val);
		
		// Сохраняем
		save_obj_data($('#another_pic_db_' + id), 'input', 'm_pics', id);
		
		// Формируем список картинок
		show_another_pics(id);
	}
	
	return false;
}

// Выводит список прикрепленных файлов
function show_files(id)
{
	inner_text = '';
	val = $('.reviews_files_' + id).val();
	if (val)
	{
		inner_text = '';
		data = JSON.parse(val, function (key, value) { return value; });
		len = data.length;
		for (i = 0; i < len; i++)
		{
			inner_text = inner_text + '<div class="order_f_item">';
			inner_text = inner_text + '	<div class="order_f_item_text">- <a href="' + data[i][1] + '" target="_blank">' + data[i][0] + '</a> <span class="order_f_item_close" title="Удалить" onclick="delete_file(\'' + id + '\', ' + i + ');">&nbsp;</span></div>';
			inner_text = inner_text + '	<div class="clear"></div>';
			inner_text = inner_text + '</div>';
		}
	}
	$('.order_files_list.files_' + id).html(inner_text);
}

// Удаление файла
function delete_file(id, number)
{
	val = $('.reviews_files_' + id).val();
	if (val)
	{
		data = JSON.parse(val, function (key, value) { return value; });
		len = data.length;
		new_data = new Array();
		x = 0;
		for (i = 0; i < len; i++)
			if (i != number)
			{
				new_data[x] = data[i];
				x = x + 1;
			}
		
		val = JSON.stringify(new_data, function (key, value) { return value; });
		$('.reviews_files_' + id).val(val);
		show_files(id);
	}
}

// Показывает / скрывает писание продукта
function toggle_prod_text(obj)
{
	if ($(obj).hasClass('show'))
	{
		$(obj).removeClass('show');
		$(obj).addClass('hide');
		$(obj).text('Скрыть');
		$(obj).parent().parent().parent().find('.prod_text_line').hide();
		$(obj).parent().parent().parent().find('.full_text').removeClass('prod_text_content');
	}
	else
	{
		$(obj).removeClass('hide');
		$(obj).addClass('show');
		$(obj).text('Подробнее');
		$(obj).parent().parent().parent().find('.prod_text_line').show();
		$(obj).parent().parent().parent().find('.full_text').addClass('prod_text_content');
	}
}

// Быстрый просмотр о продукте
var is_load_product = '';
function show_product(id)
{
	if (is_load_product == '')
	{
		is_upload = 'yes';
		$.modal.close();
		show_load('Идет загрузка...');
		
		var fd = new FormData;
		fd.append('action', 'get_proct_info');
		fd.append('id', id);
		
		$.ajax({
			url: '/geobazar/ajax.php',
			data: fd,
			processData: false,
			contentType: false,
			type: 'POST',
			success: function (data) {
				$.modal.close();
				
				if (data != 'error')
				{
					w = $(window).width();
					if (w >= 1000)
					{
						$('#quick_box').html(data);
						show_object('quick_box');
						
						CloudZoom.quickStart();
						
						jQuery(document).ready(function(){
							$('.jcarousel')
								.jcarousel({
									vertical: true
								});

							$('.jcarousel-control-prev')
								.on('jcarouselcontrol:active', function() {
									$(this).removeClass('inactive');
								})
								.on('jcarouselcontrol:inactive', function() {
									$(this).addClass('inactive');
								})
								.jcarouselControl({
									target: '-=1'
								});

							$('.jcarousel-control-next')
								.on('jcarouselcontrol:active', function() {
									$(this).removeClass('inactive');
								})
								.on('jcarouselcontrol:inactive', function() {
									$(this).addClass('inactive');
								})
								.jcarouselControl({
									target: '+=1'
								});
						});
					}
				}
				else show_message('error', 'Ошибка', 'Не удалось загрузить информацию.');
				
				is_upload = '';
			}
		});
		return false;
	}
}

// Список вариантов городов
function show_city_variant()
{
	val = $('#city_pole').val();
	len = val.length;
	
	if (len > 2)
	{
		country = $('#adress_country').val();
		
		$.getJSON(
			'/geobazar/ajax.php',
			{action:'get_city', country:country, search:val},
			function(data) {
				inner_text = '';
				count = data.length;
				if (count > 0)
				{
					for (var key in data)
					{
						regex = new RegExp('(' + val + ')', 'gi');
						nazv = data[key][2].replace(regex, "<b>$1</b>");
						inner_text = inner_text + '<div class="basket_variant_item" onclick="select_city(\'' + data[key][0] + '\', \'' + data[key][1] + '\', \'' + data[key][2] + '\', \'' + data[key][3] + '\');">' + data[key][1] + '. ' + nazv;
						if (data[key][3]) inner_text = inner_text + '<span>, ' + data[key][3] + '</span>';
						inner_text = inner_text + '</div>';
					}
					
					if (count > 5) $('.basket_variant_list').addClass('scroll');
						else $('.basket_variant_list').removeClass('scroll');
					
					$('.basket_variant_list').html(inner_text);
					$('.basket_variant_list').show();
				}
				else
				{
					$('.basket_variant_list').html('');
					$('.basket_variant_list').hide();
				}
			}
		);
	}
	else
	{
		$('.basket_variant_list').html('');
		$('.basket_variant_list').hide();
	}
}

// Выбор города (Корзина)
function select_city(city_id, type, nazv, region)
{
	$('#adress_city_id').val(city_id);
	$('#adress_city_type').val(type);
	$('#adress_city_nazv').val(nazv);
	$('#adress_region_nazv').val(region);
	
	$('#city_pole').val(nazv);
	
	show_delivery();
}

// Показывает доставку
function show_delivery()
{
	country = $('#adress_country').val();
	city_id = $('#adress_city_id').val();
	type = $('#adress_city_type').val();
	nazv = $('#adress_city_nazv').val();
	region = $('#adress_region_nazv').val();
	city_pole = $('#city_pole').val();
	
	$('.basket_variant_list').html('');
	$('.basket_variant_list').hide();
	
	if (city_id || city_pole)
	{
		$('.block_city_input').hide();
		$('.block_city_text').show();
		$('.block_adress').show();
		$('.basket_load_box').show();
		$('.basket_delivery_variant').hide();
		
		if (city_id)
		{
			$('#region_sv').hide();
			$('#country_sv').hide();
			
			txt = type + '. ' + nazv;
			if (region) txt = txt + ', ' + region;
			$('.reg_item_text_in').html(txt);
		}
		else
		{
			$('#region_sv input').val('');
			$('#region_sv').show();
			
			$('#country_sv input').val('');
			country = $('#adress_country').val();
			if (country == 'else') $('#country_sv').show();
				else $('#country_sv').hide();
			
			$('.reg_item_text_in').html(city_pole);
		}
		
		$.getJSON(
			'/geobazar/ajax.php',
			//{action:'get_delivery', country:country, city_id:city_id, count:show_count},
			{action:'get_cdek_variants', country:country, city_id:city_id},
			function(data) {
				delivery_arr = data;
				
				konstruktor_delivery();
				
				$('.basket_load_box').hide();
				$('.basket_delivery_variant').show();
			}
		);
	}
}

// Сбирает варианты сборки
function konstruktor_delivery()
{
	let tmp = "";
	delivery_arr.forEach(
	    function(item) {
		tmp += "<p>" + item.name + ", стоимость - " + item.cost + "руб., срок - " + item.time +" дн.</p>";
	    }
	);
	$('#cdek_result').html(tmp);
	
	return;
	$('.basket_delivery_podpis').hide();
	
	delivery_id = $('#delivery_id').val();
	payment_id = $('#payment_id').val();
	
	$('.basket_delivery_variant .radio_item').hide();
	$('.basket_delivery_variant .radio_label').removeClass('radio_label_active');
	
	if (delivery_id)
	{  
		a = 1;
		x = delivery_id.split('_');
		if (!delivery_arr[x[0]]) a = 2;
		if (a == 1 && !delivery_arr[x[0]][x[1]]) a = 2;
		if (a == 2)
		{
			delivery_id = '';
			$('#delivery_id').val(delivery_id);
		}
		
		if (a == 1 && delivery_arr[x[0]][x[1]]['star']) $('.' + delivery_arr[x[0]][x[1]]['star']).show();
	}
	
	for (key_v in delivery_arr)
	{
		item = delivery_arr[key_v];
		
		$('.title_home').hide();
		if (key_v == 'home' && item) $('.title_home').show();
		
		for (key in item)
		{
			id = key_v + '_' + key;
			
			if (!delivery_id)
			{
				delivery_id = id;
				$('#delivery_id').val(delivery_id);
			}
			
			price_text = '';
			if (item[key]['price']) price_text = item[key]['price'] + ' ' + item[key]['currency'];
				else if (item[key]['currency']) price_text = item[key]['currency'];
			
			price_text_show = price_text;
			if (item[key]['star']) price_text_show = price_text_show + ' <i>*</i>';
			if (price_text_show) price_text_show = '- ' + price_text_show;
			$('.b_delivery_' + id + ' b').html(price_text_show);
			
			if (item[key]['days'])
			{
				/*$('.b_delivery_' + id + ' span').text('(' + item[key]['days'] + ' дн.)');
				$('.b_delivery_' + id + ' span').show();*/
				$('.b_delivery_' + id + ' span').hide(); // Скрываем (там попросил клиент)
			}
			else $('.b_delivery_' + id + ' span').hide();
			$('.b_delivery_' + id).show();
			
			if (id == delivery_id)
			{
				x = show_price + item[key]['price'];
				$('#all_price').html(x);
				$('#delivery').val(item[key]['price']);
				
				$('.b_delivery_' + id + ' input').prop('checked', true);
				$('.b_delivery_' + id + ' label').addClass('radio_label_active');
				
				pay = item[key]['pay'].split(',');
				
				if (payment_id)
				{
					a = 2;
					for (key_p in pay)
						if (pay[key_p] == payment_id) a = 1;
					if (a == 2)
					{
						payment_id = '';
						$('#payment_id').val(payment_id);
					}
				}
				
				for (key_p in pay)
				{
					id = pay[key_p];
					
					if (!payment_id)
					{
						payment_id = id;
						$('#payment_id').val(payment_id);
					}
					
					$('.b_payment_' + id).show();
					
					if (id == payment_id)
					{
						$('.b_payment_' + id + ' input').prop('checked', true);
						$('.b_payment_' + id + ' label').addClass('radio_label_active');
					}
				}
				
				$('#all_delivery').text(price_text);
			}
			
			good_price('.price');
		}
	}
}

// Меняет доставку / оплату
function change_delivery(type, id)
{
	if (type == 'delivery_id') $('#delivery_id').val(id);
	if (type == 'payment_id') $('#payment_id').val(id);
	
	konstruktor_delivery();
}

// Сброс города (Корзина)
function reset_city()
{
	$('.block_city_input').show();
	$('.block_city_text').hide();
	$('.block_adress').hide();
	$('.basket_delivery_variant').hide();
	
	$('#adress_city_id').val('');
	$('#adress_city_type').val('');
	$('#adress_city_nazv').val('');
	$('#adress_region_nazv').val('');
	
	delivery_pay = 0;
	//$('#all_price').html(show_price);
	$('#all_delivery').html('');
	
	$('#delivery_id').val('');
	$('#payment_id').val('');
	$('.reg_item_input.hide_basket input').val('');
}

// Показывает размер для выбора
function show_razmer(id)
{
	$.getJSON(
		'/geobazar/ajax.php',
		{action:'get_product_size', id:id},
		function(data) {
			if (data['one'])
			{
				x = '';
				inner_text = '<div>';
				if (data['two'] != '')
				{
					x = 'two';
					obj = data['one'];
					inner_text = inner_text + '<div><div class="p_size_title modal">' + obj['info']['nazv'] + ':</div><div class="p_size_list modal">';
					for (key in obj['list'])
					{
						inner_text = inner_text + '<div id="modal_check_par_' + obj['list'][key]['indexid'] + '-" class="prod_size_item" title="Выбрать" onclick="return check_parametr(\'' + obj['list'][key]['indexid'] + '-\', \'' + data['price_basket'] + '\', \'modal\');">' + obj['list'][key]['nazv'] + '</div>';
					}
					inner_text = inner_text + '<div class="clear"></div></div><div class="clear"></div></div>';
					
					obj = data['two'];
					inner_text = inner_text + '<div><div class="p_size_title modal">' + obj['info']['nazv'] + ':</div><div class="p_size_list modal">';
					for (key in obj['list'])
					{
						inner_text = inner_text + '<div id="modal_check_par_-' + obj['list'][key]['indexid'] + '" class="prod_size_item" title="Выбрать" onclick="return check_parametr(\'-' + obj['list'][key]['indexid'] + '\', \'' + data['price_basket'] + '\', \'modal\');">' + obj['list'][key]['nazv'] + '</div>';
					}
					inner_text = inner_text + '<div class="clear"></div></div><div class="clear"></div></div>';
				}
				else
				{
					x = 'one';
					obj = data['one'];
					inner_text = inner_text + '<div class="p_size_title modal">' + obj['info']['nazv'] + ':</div><div class="p_size_list modal">';
					for (key in obj['list'])
					{
						inner_text = inner_text + '<div id="modal_check_par_' + obj['list'][key]['indexid'] + '" class="prod_size_item" title="Выбрать" onclick="return check_parametr(\'' + obj['list'][key]['indexid'] + '\', \'' + data['price_basket'] + '\', \'modal\');">' + obj['list'][key]['nazv'] + '</div>';
					}
					inner_text = inner_text + '<div class="clear"></div></div><div class="clear"></div>';
				}
				
				inner_text = inner_text + '<div class="razmer_modal_buttons"><div class="button blue to_basket" onclick="return pre_add_to_basket(' + id + ', \'' + x + '\', \'modal\');">В корзину</div></div>';
				
				$('#razmer_modal_content').html(inner_text);
				show_object('razmer_modal_box');
			}
			else show_message('', '', 'Выберите размер.');
		}
	);
	
	return false;
}

// Очищает размеры
function clear_size(id)
{
	$('#pjax_hover').show();
	
	// Отправляем ajax запрос на сохранение
	$(function(){
		$.get(
			'',
			{action:'save_obj', pole:'clear_size', id:id},
			function(data){
				$('#pjax_hover').hide();
				
				if (data != 'error') $('[id*=min_k_' + id + '_25_]').prop('checked', false);
			}
		);
	});
}

// Фиксация в меню в шапке
function show_mobile_top_block()
{
	w = $(window).width();
	if (w < 1010)
	{
		scroll_top = $(document).scrollTop();
		top_height = $('.top_line_out').height();
		if (scroll_top > top_height) $('.mob_top_block').addClass('null');
			else $('.mob_top_block').removeClass('null');
	}
}

// Испольуется в объекте 'Добавить товар' (Вывод формы)
var load_products = '';
function get_product()
{
	// Очишаем временные переменные
	load_products = '';
	
	$('#p_search_input').val('');
	$('#rel_content').html('');
	$('#relatedbox').modal();
	return false;
}

// Испольуется в объекте 'Добавить товар' (Получения списка продуктов)
function product_search()
{
	var val, inner_text, number;
	
	// Вгружаем заставку
	$('#rel_content').html('<div class="rel_content_loader"><img src="/admin/images/loader.gif" alt="" /></div>');
	
	val = $('#p_search_input').val();
	len = val.length;
	
	if (len > 2)
	{
		now = new Date();
		$.getJSON(
			'',
			{action:'get_products_lk', search:val, time:now},
			function(data){
				len = data.length;
				if (len > 0)
				{
					inner_text = '<div class="rel_result_box">';
					number = 0;
					count = 0;
					for (var key in data)
					{
						if (count < 100)
						{
							number = number + 1;
							inner_text = inner_text + '<div class="rel_result_item">';
							inner_text = inner_text + '	<a href="' + data[key]['url'] + '" class="rel_result_picture" style="background: url(\'' + data[key]['picture'] + '\') no-repeat center center;" target="_blank"></a>';
							inner_text = inner_text + '	<div class="rel_result_info">';
							inner_text = inner_text + '		<b>Название:</b> <a href="' + data[key]['url'] + '" target="_blank">' + data[key]['nazv'] + '</a><br />';
							inner_text = inner_text + '		<b>Раздел:</b> ' + data[key]['category_nazv'] + '<br />';
							inner_text = inner_text + '		<b>Цена:</b> ' + data[key]['price'] + ' ' + data[key]['symbol'];
							if (data[key]['last_size'] == 'yes') inner_text = inner_text + ' <span class="last_size">Купи выгодно</span>';
							inner_text = inner_text + '		<br />';
							inner_text = inner_text + '		<b>Размер:</b> <select id="rel_select_' + data[key]['indexid'] + '">';
							
							size = data[key]['size'];
							if (size.length != 0)
							{
								x = '';
								for (var key_s in size)
								{
									if (!x)
									{
										if (key_s != 'no') inner_text = inner_text + '<option value=""></option>';
										x = 'yes';
									}
									inner_text = inner_text + '<option value="' + key_s + '">' + size[key_s] + '</option>';
								}
							}
							
							inner_text = inner_text + '</select> <span class="button blue" onclick="return relatedbox_save(' + data[key]['indexid'] + ', \'catalog\');">Добавить</span>';
							inner_text = inner_text + '	</div>';
							inner_text = inner_text + '	<div class="clear"></div>';
							inner_text = inner_text + '</div>';
							if (number == 2)
							{
								number = 0;
								inner_text = inner_text + '<div class="clear"></div></div><div class="rel_result_line"></div><div class="rel_result_box">';
							}
							count = count + 1;
						}
					}
					inner_text = inner_text + '<div class="clear"></div></div>';
					
					if (count == 100) inner_text = inner_text + '<div class="rel_result_text">Показаны первые 100 моделей. Уточните запрос для более точного поиска.</div>';
				}
				else
				{
					inner_text = 'Товары, удовлетворяющий условия, в каталоге отсутсвуют.';
				}
				$('#rel_content').html(inner_text);
			}
		);
	}
	else
	{
		$('#rel_content').html('Слишком короткая фраза для поиска. Введите минимум 3 символа.');
	}
	
	return false;
}

// Испольуется в объекте 'Добавить товар' (сохраняет товар)
function relatedbox_save(id, type)
{
	if (type == 'catalog')
	{
		$('.rel_result_info select').removeClass('red');
		
		val = $('#rel_select_' + id).val();
		if (val)
		{
			$('#add_product_type').val(type);
			$('#add_product_id').val(id);
			$('#add_product_size').val(val);
			
			submit_form('add_product');
		}
		else $('#rel_select_' + id).addClass('red');
	}
	
	if (type == 'another')
	{
		another_brand_id = $('#another_prod_brand_id').val();
		another_nazv = $('#another_prod_nazv').val();
		another_size = $('#another_prod_par_one').val();
		another_color = $('#another_prod_color').val();
		
		if (another_brand_id && another_nazv && another_size)
		{
			$('#add_product_type').val(type);
			$('#add_product_brand_id').val(another_brand_id);
			$('#add_product_nazv').val(another_nazv);
			$('#add_product_size').val(another_size);
			$('#add_product_color').val(another_color);
			
			submit_form('add_product');
		}
		else show_message('', '', 'Все поля, помеченные "*", обязательны для заполнения.');
	}
	
	return false;
}

// Переключение вкладок в объекте 'Добавить товар'
function relative_vkladka(obj, action)
{
	$('.relative_vkladki_item').removeClass('active');
	$(obj).addClass('active');
	$('[id*=rel_vkladki_]').hide();
	$('#rel_vkladki_' + action).show();
}

// Плавающий блок
function swimming_block(data)
{
	w = $(window).width();
	if (w >= 1000)
	{
		height_window = $(window).height();
		height_obj = $(data['block']).height();
		scroll_top = $(document).scrollTop();
		
		// Контейнер для плавающего блока
		if (!$(data['block']).hasClass('start_swim_scroll'))
		{
			$(data['block']).wrapInner('<div class="swim_scroll_box"></div>');
			$(data['block']).css('height', $(data['block']).height());
			$(data['block']).addClass('start_swim_scroll');
			$(data['block']).find('.swim_scroll_box').attr('data-scroll', scroll_top);
		}
		else
		{
			$(data['block']).css('height', $(data['block']).find('.swim_scroll_box').height());
		}
		
		// Координаты границ
		var coordinates = new Array();
		x = $(data['out_box']).offset();
		coordinates['top'] = Math.round(x['top']);
		coordinates['bottom'] = coordinates['top'] + $(data['out_box']).height();
		
		obj = $(data['block']).find('.swim_scroll_box');
		
		// Если помещается в экран (просто прибиваем кверху)
		if (height_obj <= height_window)
		{
			if (scroll_top >= coordinates['top'])
			{
				$(data['block']).addClass('swim_scroll');
				$(obj).css('width', $(data['block']).width() + 'px');
				h = obj.height();
				if (coordinates['bottom'] >= scroll_top + h)
				{
					$(obj).removeClass('absolute');
					$(obj).addClass('fixed');
					$(obj).css('margin-top', '0px');
				}
				else
				{
					$(obj).removeClass('fixed');
					$(obj).addClass('absolute');
					t = $(data['out_box']).height() - h;
					$(obj).css('margin-top', t + 'px');
				}
			}
			else
			{
				$(data['block']).removeClass('swim_scroll');
				$(obj).removeClass('fixed');
				$(obj).removeClass('absolute');
				$(obj).css('width', 'auto');
				$(obj).css('margin-top', '0px');
			}
		}
		
		// Если не помещается в экран (прорабатывается прокрутка)
		if (height_obj > height_window && $(data['out_box']).height() > height_obj)
		{
			data_scroll = $(obj).attr('data-scroll');
			
			// Прокрутил вниз
			if (data_scroll <= scroll_top)
			{
				// Прокрутили ниже статического блока
				if (scroll_top >= coordinates['top'] + height_obj - height_window)
				{
					$(data['block']).addClass('swim_scroll');
					$(obj).css('width', $(data['block']).width() + 'px');
					real = $(obj).offset();
					real_top = Math.round(real['top']);
					if (scroll_top + height_window - real_top - height_obj >= 0 && scroll_top + height_window <= coordinates['bottom'])
					{
						$(obj).css('position', 'fixed');
						$(obj).css('top', 'auto');
						$(obj).css('bottom', '0px');
						$(obj).css('margin-top', '0px');
					}
					else if (scroll_top + height_window > coordinates['bottom'])
					{
						margin_top = $(data['out_box']).height() - height_obj;
						$(obj).css('position', 'absolute');
						$(obj).css('top', 'auto');
						$(obj).css('bottom', 'auto');
						$(obj).css('margin-top', margin_top + 'px');
					}
					else
					{
						position = $(obj).css('position');
						if (position == 'fixed')
						{
							margin_top = scroll_top - coordinates['top'];
							$(obj).css('position', 'absolute');
							$(obj).css('top', 'auto');
							$(obj).css('bottom', 'auto');
							$(obj).css('margin-top', margin_top + 'px');
						}
					}
				}
				else
				{
					$(data['block']).removeClass('swim_scroll');
					$(obj).css('position', 'static');
					$(obj).css('top', 'auto');
					$(obj).css('bottom', 'auto');
					$(obj).css('margin-top', '0px');
					$(obj).css('width', 'auto');
				}
			}
			
			// Прокрутил вверх
			if (data_scroll > scroll_top)
			{
				// Прокрутили ниже статического блока
				if (scroll_top >= coordinates['top'])
				{
					$(data['block']).addClass('swim_scroll');
					$(obj).css('width', $(data['block']).width() + 'px');
					real = $(obj).offset();
					real_top = Math.round(real['top']);
					if (real_top >= scroll_top)
					{
						$(obj).css('position', 'fixed');
						$(obj).css('top', '0px');
						$(obj).css('bottom', 'auto');
						$(obj).css('margin-top', '0px');
					}
					else
					{
						position = $(obj).css('position');
						if (position == 'fixed')
						{
							margin_top = scroll_top + height_window - height_obj - coordinates['top'];
							$(obj).css('position', 'absolute');
							$(obj).css('top', 'auto');
							$(obj).css('bottom', 'auto');
							$(obj).css('margin-top', margin_top + 'px');
						}
					}
				}
				else
				{
					$(data['block']).removeClass('swim_scroll');
					$(obj).css('position', 'static');
					$(obj).css('top', 'auto');
					$(obj).css('bottom', 'auto');
					$(obj).css('margin-top', '0px');
					$(obj).css('width', 'auto');
				}
			}
		}				
		
		$(data['block']).find('.swim_scroll_box').attr('data-scroll', scroll_top);
	}
}

// Работает в мобильном меню
function show_menu_box(obj)
{
	if ($(obj).hasClass('active')) $(obj).removeClass('active');
		else $(obj).addClass('active');
}

// Личный кабинет показывает / скрывает
function profile_menu()
{
	w = $(window).width();
	if (w < 1010)
	{
		$('.menu_personal').show();
		return false;
	}
	return true;
}

// Раскрывает список ссылок в футере
function footer_links_change(id)
{
	w = $(window).width();
	if (w < 1010)
	{
		$('#footer_link_' + id).toggle();
	}
}

// Клик по звездочкам
function go_to_reviews()
{
	$('.reviews_top_item').removeClass('active');
	$('#link_otziv').addClass('active');
	$("[id*=button_]").hide();
	$('#button_otziv').show();
	$('.product_form').hide();
	$("[id*=list_]").hide();
	$('#list_otziv').show();
	show_product_form($('#button_otziv'));
	
	x = $('.reviews_box').offset();
	x['top'] = x['top'] - 50;
	$('body,html').animate({
		scrollTop: x['top']
	}, 800);
}

// Вкладки в авторизации
function auth_mode(act)
{
	$('.auth_vkladka_item').removeClass('active');
	$('.auth_vkladka_item.' + act).addClass('active');
	
	$('.auth_mode').hide();
	$('.auth_mode.' + act).show();
}

function setgoal(goal)
{
	if (goal == 'order')
	{
		ym(25149110, 'reachGoal', 'order');
        ga('send', 'event', {
			'eventCategory': 'button',
			'eventAction': 'order',
		});
		return true;
	}
	
	if (goal == 'fast_order')
	{
		ym(25149110, 'reachGoal', 'fast_order');
		ga('send', 'event', {
			'eventCategory': 'button',
			'eventAction': 'fast_order',
		});
	}
	
	if (goal == 'add_cart')
	{
		ym(25149110, 'reachGoal', 'add_cart');
		ga('send', 'event', {
			'eventCategory': 'button',
			'eventAction': 'add_cart',
		});
	}
	
	if (goal == 'buy')
	{
		ym(25149110, 'reachGoal', 'buy');
		ga('send', 'event', {
			'eventCategory': 'button',
			'eventAction': 'buy',
		});
	}
	
	if (goal == 'add_to_existing_order')
	{
		ym(25149110, 'reachGoal', 'add_to_existing_order');
	}
	
	if (goal == 'order_1click')
	{
		ym(25149110, 'reachGoal', 'order_1click');
	}
}

// Показывает / Скрывает поле поиска в моб. версии
function show_search()
{
	stat = $('.top_s_box').css('display');
	if (stat == 'none')
	{
		$('.top_s_box').show();
		$('.top_s_box input').focus();
	}
	else $('.top_s_box').hide();
}

// Показывает Наличие у товаров
function show_nalichie(obj)
{
	val = $(obj).val();
	$(obj).parent().parent().find('.manager_nalich_right').hide();
	if (val) $(obj).parent().parent().find('.'+val).show();
}