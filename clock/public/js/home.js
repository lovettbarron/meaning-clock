$(document).ready( function(){
	$('.success').hide();
	$('#bio').hide();
	if( (document.URL).search("[login]{5}") > 2) {
		$('.clockText').hide();
	} else {
		$('#login').hide();	
	}
	//Request account
	$('#newRequest').click( function(e){
			e.preventDefault();
			request();
	});

	$('#bioExpand').click( function(e) {
		if(!$(this).hasClass('visible')) {
			$(this).fadeOut(100);
			$('#bio').slideDown(600, function() {
				$(this).find('p').delay(300).fadeIn(900);
			});
			
		}

	});

	$('input:not(#password)').keypress(function(e) {
		if(e.keyCode == 13) $(this).next().focus();
	});

	$('input#password').keypress(function(e) {
		if(e.keyCode == 13) request();
	});

	$('a.login').click(function(e) {
		e.preventDefault();
		$('.clockText').fadeOut(500, function() {
			$('#login').fadeIn(500);	
		});
		
	});
	$('a.backToHome').click(function(e) {
		e.preventDefault();
		$('#login').fadeOut(500, function() {
			$('.clockText').fadeIn(500);
		});
	})
});
	
function request() {
	var message = {};
	message.name = $('#username').val();
	message.email = $('#email').val();
	message.password= $('#password').val();

	if(message.username == '' || message.email == '' || message.email == '') {
		$('.error').show();
	} else {

	$.post('/request', message, function(data) {
		console.log('Successful:' + data);
		$('.request').fadeOut(100, function() {
			$('.success').fadeIn(100);
			})
		});
	}
}