var app = app || {};

$(function() {
	app.inviteView = Backbone.View.extend({
		el: $('#inviteToEnter')
		, template: _.template($("#blankMeaning").html())
		, events: {
			'click': 'done'
		}
	
		, initialize: function() {
			this.bind('entryViewDown', this.done, this);
			this.render;

		}
		
		, render: function() {
			console.log("Rendering invite");
		  	$(this.el).html(this.template);
			return this;
		}
		, done: function() {
			this.$el.slideUp(100).remove();
			app.AppView.enterMeaning();
		}
	})


});