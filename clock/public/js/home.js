$(document).ready( function(){
	$('.success').hide();
	$('#bio').hide();
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