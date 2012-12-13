var app = app || {};

$(function() {
	app.statsView = Backbone.View.extend({
		el: $('#main')
		, template: _.template($("#statsTemplate").html())
		, events: {

		}
	
		, initialize: function() {
			this.render();

		}
		
		, render: function() {
			console.log("Rendering stats");
		  	$(this.el).html(this.template);
			return this;
		}
	})


});