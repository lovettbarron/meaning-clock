var app = app || {};

$(function( $ ) {
	app.AppView = Backbone.View.extend({
		el: $("#meaningClock")
		
		, events: {
			'click .addOne' : 'enterMeaning'
			, 'click .removeAll' : 'resetCollection'
			, 'tap .menuBtn'	: 'activateMenu'
			, 'click .menuBtn'	: 'activateMenu'
		}
	
		, initialize: function() {
			this.clockView = new app.ClockView();
			this.menuOpen = false;

			app.MeaningList = new app.MeaningCollection();

			app.menu = new app.menuView();
			app.menu.initialize();

			app.main = new app.mainView();
			app.main.initialize();
			app.focus = app.main;
			
			app.response = new app.responseView();

		}

		, activateMenu: function() {
			app.menu.activate();
		}

		, enterMeaning: function() {
			if(!this.entryView)
				this.entryView = new app.DataEntryView();
			else {
				this.entryView.initialize();
			}
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