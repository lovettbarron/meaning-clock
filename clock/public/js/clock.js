(function($) {
	window.appView = Backbone.View.extend({
		el: $('#content');
		events: {
			'click#meaning' : 'showMeaningEntry'
		},
		initialize: function() {
			this.meaning = new Meanings( null, { view: this });
		},
		showMeaningEntry: function() {
			var meaningEntry = 
			var meaningDuration = 
		}
	});
	
	var Meaning = Backbone.Model.extend({
		date: null
		, time: null
		, meaning: null
		, duration: null
	});
	
	var Meanings = Backbone.Collection.extend({
		initialize: function (models, options) {
		this.bind("add", options.view.addMeaning);
	});
	
	var MeaningList = Backbone.View.extend({
		tagName: "ul",
		events: {
			
		},
		initialize: function() {
			_bindAll(this,"render","add");
			this.collection.bind("all",this.render);
		},
		render: function() {
			var ul = $("ul");
			ul.empty();
			this.collection.each(function(meaningItem) {
				var meaning = new MeaningItem({model: Meaning});
				ul.append(meaning.render().el);
			})
		}
	});
	
	var MeaningItem = Backbone.View.extend({
		tagName: 'li';
		className: 'meaning'
		events: {
			'click .delete' : 'remove'
		},
		initialize: function() {
		  _.bindAll(this, "render", "remove");
      this.collection.bind("all", this.render);``	
		},
		remove: function() {
			alert('Delete this meaningful time?', function() {
				this.model.destroy();
			})
		},
		render: function() {
			$(this.el).append(meaningList).html(this.template(this.model.toJSON()));
			return this;
		}
	})
	
	var appView = new appView;
	
})(jQuery);