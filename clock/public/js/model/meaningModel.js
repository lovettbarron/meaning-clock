var app = app || {};

$(function() {
	app.MeaningModel = Backbone.Model.extend({

		defaults: function() {
			return {
			_id: null
			,date: new Date()
			, meaning: "Not meaningful"
			, duration: 1
			}
		}

		, initialize: function() {
		  if (!this.get("meaning")) {
			this.set({"meaning": this.defaults.meaning});
			}	
		  if (!this.get("duration")) {
			this.set({"duration": this.defaults.duration});
			}
		}
		, toggle: function() {
//      this.save({done: !this.get("done")});
		}

		, validate: function(attrs) {
			if(isNaN(attrs.duration)) {
				console.log("Duration must be a number")
				return "Duration must be a number"
			}
		}
		
	});
});