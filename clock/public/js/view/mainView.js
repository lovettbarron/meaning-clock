var app = app || {};

$(function() {
	app.mainView = Backbone.View.extend({
		el: $('#main')
		, template: _.template($("#mainTemplate").html())
		, events: {
			'click .addOne' : 'enterMeaning'
			, 'click .submit' : 'submitMeaning'
		}
	
		, initialize: function() {

			app.MeaningList.bind('add', this.addOne, this);
			app.MeaningList.bind('reset', this.addAll, this);
			//app.MeaningList.bind('all', this.render, this);
			app.MeaningList.bind('refresh', this.render, this);
			app.MeaningList.fetch( {
				success: function(model, response) {
					console.log('Returned collection' + model);
				}
				, error: function(model, response) {
					console.log('Error' + JSON.stringify(model) + " err: " + JSON.stringify(response));
				}
			});

			app.MeaningList.bind('change', this.renderStats, this);

			//if(app.response == undefined)
			app.response = new app.responseView();
			app.response.render();
			this.render().renderStats();

			app.response.initialize();

		}

		, renderStats: function() {
			var percentOfDayCompleted = ( (new Date().getHours() + 1) / 24  );
			var meaningfulHours = (24 - ( app.MeaningList.timeLeftToday() ) ) / percentOfDayCompleted  ;

			$('.stats span').html(meaningfulHours);
			return this;
		}

		, enterMeaning: function() {
			console.log('Trigger entry')
			if(app.input == undefined)
				app.input = new app.inputView();
			else
				app.input.render();
		}
		
		, submitMeaning: function() {
			//app.input.save();
		}

		, addOne: function(meaning, iter) {
			var view = new app.MeaningView({model: meaning});
			$('ul#meaningList').prepend(view.render().el);
		}
		
		, addAll: function() {
    	  app.MeaningList.each(this.addOne, true);
    	  // This tosses out a reminder to post if you haven't posted today.
    	  if(app.MeaningList.postsPerDay()[new Date().getDate()] === undefined)
    	  	if(!app.invite) {
				app.invite = new app.inviteView();
				app.invite.render();
			} else {
				app.invite.render()
			
			}
    	}

		, render: function() {
			console.log("Rendering main view");
		  	$(this.el).html(this.template);
		  	app.response.render();
		  	this.addAll();
			return this;
		}
	})


});