var time = new Date();
var custom = false;
var spentToday = 0;

function printTime() {
	time = new Date();
	var flash;
	var sec = time.getSeconds();
	var min = time.getMinutes();
	var hour = time.getHours();
	
	if(min <= 9) { min = '0' + min };
	
	if(sec%2 == 0) { flash = 'On'; } 
	else { flash = 'Off'; }
	
	output = hour + '<span class="flash' + flash + '">:</span>' + min;
	$('.clockface').html(output + '<h3>You have ' + timeLeft() + ' hours in the day left.</h3>');
}

function loop() {
    setInterval(function() {
			printTime();
    }, 100);
}

(function() {
  function hideFlashMessages() {
    $(this).fadeOut();
  }

  setTimeout(function() {
    $('.flash').each(hideFlashMessages);
  }, 5000);
  $('.flash').click(hideFlashMessages);
})();


$(document).ready( function(){
	$('#newEntry').hide();
	$('#newThing > btn').click( function(e) {
			e.preventDefault();
			$('#selection').hide();
			$('#newThing').hide();
			$('input#newEntry').show();
			custom = true;
		});
	activities();
	$('#submit').click( function(e) {
		e.preventDefault();
		var message = {};
		
		if(custom) {
			message.activity = $('input#newEntry').val();
		} else {
			message.activity = $('#selection > select').val();
		}
		
		message.time = time;
		message.duration = $('#hour').val();
		
		$.post('/entry', message, function(data) {
			console.log('Successful:' + data);
			success();
			});
		});
	$(loop);
	
  });

function activities() {
	$.post('/act', function(data) {
		console.log('act:' + JSON.stringify(data) );
		count = 0;
		$('#feedback > div').html('');

		// Loop through info
		$('option').remove();
		for( var key in data.resp ) {
			$('select').append('<option>' + data.resp[key].activity + '</option>');
			var todayDate = data.resp[key].time;
			var currentDate = time.getDate();
			console.log( parseInt(todayDate.substr(8,2)) + ' vs ' + parseInt(currentDate));
			if( parseInt(todayDate.substr(8,2)) === parseInt(currentDate) ) {
				console.log("Adding " + data.resp[key].activity);
				custom += data.resp[key].duration;
				$('#feedback > div').append('You have spent ' + data.resp[key].duration + ' hours doing ' + data.resp[key].activity + ' today<br>');
			}
		}
		
		// Fill in
		$.post('/feedback', function(data) {
			console.log(data);
			$('.timeLeft').html('You\'ve had ' + data.count + ' meaningful hours.');
		});
	});
}

//Posting animation
function success() {
	$('#entry').fadeOut(300, function(e) {
		$('#success').fadeIn(300).delay(500).fadeOut(300, function(e) {
			$('input').val('');
			$('select').val('');
			$('#selection').show();
			$('#newThing').show();
			$('input#newEntry').hide();
			$('#entry').fadeIn(300);
			custom = false;
			activities();
		})
	})
}

function timeLeft() {
	var left = 24 - time.getHours()
	return left;
}

function questions() {
	var good = [
	'how does that make you feel?'
	,'what did you see today?'
	,'do you think that was a choice?'
	,'how do you think your parents felt?'
	,'what do you feel like when someone appraises you?'
	];
	return questions[Math.floor(Math.random() * questions.length)];
}