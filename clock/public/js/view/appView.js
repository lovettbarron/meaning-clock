var app = app || {};

$(function( $ ) {
	app.AppView = Backbone.View.extend({
		el: $("#meaningClock")
		
		, events: {
			'click .removeAll' : 'resetCollection'
			, 'tap .menuBtn'	: 'activateMenu'
			, 'click .menuBtn'	: 'activateMenu'
			, 'click .submit' : 'submit'
		}
	
		, initialize: function() {
			this.clockView = new app.ClockView();
			app.MeaningList = new app.MeaningCollection();

			app.menu = new app.menuView();
			app.main = new app.mainView();

			app.response = new app.responseView({ el: this.$("#responseAnchor") });
			app.input = new app.inputView({ el: this.$("#inputAnchor") });
			app.invite = new app.inviteView();


			app.focus = app.main;

			this.bind('all', this.logEvent, this);

		}

		, logEvent: function(arg) {
			console.log("new event:" + arg)
		}

		, activateMenu: function() {
			app.menu.activate();
		}

		, resetCollection: function() {
 			alert('Remove test data?', function() {
				MeaningList.reset();
 			})
		}

		, render: function() {
			console.log('Rendering AppView');
			return this;
		}
	});
	
	});