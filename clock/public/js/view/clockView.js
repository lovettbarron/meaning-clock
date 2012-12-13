var app = app || {};

$(function() {
	app.ClockView = Backbone.View.extend({
		el: $('#clockFace')
		, events: {
		}

		, initialize: function() {
			//clockSetup();
		}

		, render: function() {
			//alert(window.clock.toString())
	  	$('#clockFace').html(window.clock);
			return this;
		}
	})
});