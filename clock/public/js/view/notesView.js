var app = app || {};

$(function() {
	app.notesView = Backbone.View.extend({
		el: $('#main')
		, template: _.template($("#notesTemplate").html())
		, events: {

		}
	
		, initialize: function() {
			this.render();

		}
		
		, render: function() {
			console.log("Rendering notes");
		  	$(this.el).html(this.template);
			return this;
		}
	})


});