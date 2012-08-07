$(document).ready( function(){
	$('.success').hide();
	//Request account
	$('#newRequest').click( function(e){
			e.preventDefault();
			request();
	})
});
	
function request() {
	var message = {};
	message.username = $('#username').val();
	message.email = $('#email').val();
	if(message.username == '' || message.email == '') {
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