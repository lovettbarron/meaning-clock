var app = app || {};

$(function() {
	app.mainView = Backbone.View.extend({
		el: $('#main')
		, template: _.template($("#mainTemplate").html())
		, events: {
			
		}
	
		, initialize: function() {

			app.MeaningList.bind('add', this.addOne, this);
			app.MeaningList.bind('reset', this.addAll, this);
			app.MeaningList.bind('all', this.render, this);
			app.MeaningList.bind('refresh', this.render, this);
			app.MeaningList.fetch( {
				success: function(model, response) {
					console.log('Returned collection' + model);
				}
				, error: function(model, response) {
					console.log('Error' + JSON.stringify(model) + " err: " + JSON.stringify(response));
				}
			});
			this.render();
			app.response = new app.responseView();
			app.response.render();
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
		  	this.addAll();
			return this;
		}
	})


});