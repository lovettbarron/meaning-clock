var app = app || {};
var ENTER_KEY = 13;

var AppState  = Backbone.Model.extend({});

$(function() {

	utils();

	// Kick things off by creating the **App**.
	new app.AppView();
	app.vent = _.extend({}, Backbone.Events);
	app.state = new AppState();



});