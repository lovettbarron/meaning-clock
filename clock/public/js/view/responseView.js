var app = app || {};

$(function() {
	app.responseView = Backbone.View.extend({
		el: $('#responseAnchor')
		, template: _.template($('#responsePane').html())
		, events: {
			'click':'render'	
		},
		initialize: function() {
			app.MeaningList.bind('change', this.render, this);
			this.render()
		}
		, render: function() {
			console.log("Response view is rendering")
			$(this.el).fadeOut(100).html(this.template({response: this.getResponse()})).fadeIn(700);
		}
		, getResponse: function() {
			var percentOfDayCompleted = ( (new Date().getHours() + 1) / 24  );
			var meaningfulHours = (24 - ( app.MeaningList.timeLeftToday() ) ) / percentOfDayCompleted  ;
			console.log("New meaningful hour test:" + meaningfulHours)
			var response;

			var none = [
			'You\'re not really using the app'
			,'What\'s meaningful to you?'
			,'What was the last thing you spent time on?'
			,'What was the last thing you just felt you had to do?'
			];
			var bad = [
			// This one is a weirdo hack to get back to the right time
			'So you\'ve only had ' + (meaningfulHours*percentOfDayCompleted) + ' today?'
			,'Your life seems dull'
			];
			var good = [
			'You\'re doing a lot to bring meaning into your life. But what are you missing?'
			,'Is work the only thing that\'s meaningful to you?'
			];
			var excellent = [
			'You seem to have a lot of purpose in your life'
			,'Are you sure all '+ (meaningfulHours*percentOfDayCompleted) +' those hours are meaningful?'
			];

			if( meaningfulHours <= 0 ) {
				response = none[arrayRandomize(none)];
			} else
			if( meaningfulHours >= 1 && meaningfulHours <= 4 ) {
				response = bad[arrayRandomize(bad)];		
			} else
			if( meaningfulHours >= 5 && meaningfulHours <= 16 ) {
				response = good[arrayRandomize(good)];		
			} else
			if( meaningfulHours >= 17) {
				response = excellent[arrayRandomize(excellent)];		
			} else
			if( meaningfulHours === undefined) {
				response = "Sorry, we couldn't get your rating";
			} else {
				response = "Something went wrong in judging you"
			}
			return response;
		}
		, done: function() {
			//$(this.el).slideUp(100);
		}
	})
	
	});