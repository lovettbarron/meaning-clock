var app = app || {};

$(function() {
	app.menuView = Backbone.View.extend({
		el: $('#menu')
		, template: _.template($("#menuTemplate").html())
		, events: {
			'click .main' : 'main'
			,'click .stats' : 'stats'
			,'click .notes' : 'notes'
			,'click .logout' : 'logout'
			, 'click .menuBtn' : 'activate'
			,'click #mainOverlay' : 'close'
		}
	
		, initialize: function() {
			this.render();
			this.open = false;

		}
		
		, render: function() {
			console.log("Rendering invite");
		  	$(this.el).html(this.template);
			return this;
		}

		, main: function() {
			//$(app.focus.el).fadeOut();
			$('#main').children().fadeOut();
			if(app.main != undefined)
				app.focus = app.main.render();
			else app.focus = app.main() = new app.mainView();
			//$(app.focus.el).fadeIn();
			$('#main').children().fadeIn();
			this.deactivate();
		}
		, stats: function() {
			
			$('#main').children().fadeOut();
			if(app.stats != undefined)
				app.focus = app.stats.render();
			else app.focus = app.stats = new app.statsView();
			$('#main').children().fadeIn();
			this.deactivate();
		}
		, notes: function() {
			$(app.main.el).fadeOut();
			app.main = app.notesView();
		}
		, logout: function() {

			
		}

		, activate: function() {
			this.open = true;
			$('#main').animate({
				marginLeft:'40%'
			},400).css({'border-left': '4px solid rgba(255,255,255,.07)'});
			$('#mainOverlay').fadeIn(400);
		}

		, deactivate: function() {
			this.open = false;
			$('#main').animate({
					marginLeft:'0'
				},400).css({'border-left': '0px solid rgba(255,255,255,.07)'});;
			$('#mainOverlay').fadeOut(400);
		}
		, isOpen: function() {
			return open;
		}
	})


});