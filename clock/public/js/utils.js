Backbone.View.prototype.close = function () {
    if (this.beforeClose) {
        this.beforeClose();
    }
    this.remove();
    this.unbind();
};

window.clock;
function clockSetup() {
	setInterval(function() {
		var time = new Date();
		var flash, left, output;
		var sec = time.getSeconds();
		var min = time.getMinutes();
		var hour = time.getHours();

		if(min <= 9) { min = '0' + min };

		if(sec%2 == 0) { flash = 'On'; } 
		else { flash = 'Off'; }
		left = 24 - time.getHours()
		window.clock = output;
		// + '<h3>You have ' + left + ' hours in the day left.</h3>';
  	$('#clockFace').html(window.clock);
	}, 100);
}

function arrayRandomize(array) {
	return Math.floor(Math.random() * array.length)
}

function stopScrolling( touchEvent ) { touchEvent.preventDefault(); }
document.addEventListener( 'touchstart' , stopScrolling , false );
document.addEventListener( 'touchmove' , stopScrolling , false );