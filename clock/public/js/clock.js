$(function(){

Backbone.View.prototype.close = function () {
    if (this.beforeClose) {
        this.beforeClose();
    }
    this.remove();
    this.unbind();
};

var clock;
function clockSetup() {
	setInterval(function() {
		var time = new Date();
		var flash, left, output;
		var sec = time.getSeconds();
		var min = time.getMinutes();
		var hour = time.getHours();

		if(min <= 9) { min = '0' + min };

		if(sec%2 == 0) { flash = 'On'; } 
		else { flash = 'Off'; }
		left = 24 - time.getHours()
		output = hour + '<span class="flash' + flash + '">:</span>' + min;
		clock = output + '<h3>You have ' + left + ' hours in the day left.</h3>';
	}, 100);
}




	var MeaningModel = Backbone.Model.extend({

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
		, clear: function() {
      this.destroy();
    }

	});


	var MeaningCollection = Backbone.Collection.extend({
		
		model: MeaningModel
		
		, localStorage: new Backbone.LocalStorage("meaning-backbone")
		//, url:"./act/",
		
		, initialize: function () {

		}
	})
	
	var MeaningList = new MeaningCollection;

	MeaningList.create({
		_id: null
		,date: new Date()
		, meaning: "Meaning Test"
		, duration: 1
		}
		, {
			_id: null
			,date: new Date()
			, meaning: "Another test"
			, duration: 2
		}
	)
//	fakeData.save();

	/******************
	* View to a model *
	*******************/
 	var MeaningView = Backbone.View.extend({
		tagName: "li"

	 	, template: _.template($('#meaning-item').html())
	
	 	, events: {
	 		'click .delete' : 'remove'
			, 'dblclick' : 'edit'
	 	}
	
	 	, initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
	 	}
	
	 	, remove: function() {
	 		alert('Delete this meaningful time?', function() {
	 			this.model.destroy();
	 		})
	 	}	
	
		, edit: function() {
			this.$el.addClass("editing");
      this.input.focus();
		}
		
	 	, render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass('done', this.model.get('done'));
      this.input = this.$('.edit');
      return this;
	 	}
 })

	/************************************************************
					The animating clock that doesn't seem to animate
	************************************************************/
	var ClockView = Backbone.View.extend({
		el: $('#clockFace')
		
		, template: _.template($('#clock').html())
	
		, events: {
		}
	
		, initialize: function() {
			this.clock = clock;

		}
		
		, render: function() {
			this.clock = clock;
			console.log("Clock: " + this.clock)
	  	$(this.el).html(this.template(this.clock));
			return this;
		}
	})
	
	/************************************************************
								Data Entry view appears and gets destroyed
	************************************************************/
	
	var DataEntryView = Backbone.View.extend({
		el: $('#entryFormAnchor')
		, template: _.template($('#dataEntry').html())
		, events: {
			'click #submit' : 'saveEntry'
			, 'keypress #meaningEntry' : 'focusDuration'
			, 'keypress #meaningDuration' : 'saveEntry'
		}
		
		, initialize: function() {
			$(this.el).html(this.template);
		}
		, saveEntry: function(e) {
			if(e.keyCode == 13) {
			var newEntry = MeaningList.create({
				_id: null
				, date: new Date()
				, meaning: $('#meaningEntry').val()
				, duration: $('#meaningDuration').val()
			});
     	this.done();
			//newEntry.save();
		}
			
		}
		, focusDuration: function(e) {
			if(e.keyCode == 13 || e.mouseClick)
				$('#meaningDuration').focus();
		}
		, done: function() {
			this.remove();
		}
	})
	
	/************************************************************
					Primary application view and rendering
	************************************************************/
	var AppView = Backbone.View.extend({
		el: $("#meaningClock")
		, events: {
			'click .addOne' : 'enterMeaning'
		}
	
		, initialize: function() {
			clockSetup();
			this.clockView = new ClockView();
			
	    MeaningList.bind('add', this.addOne, this);
      MeaningList.bind('reset', this.addAll, this);
      MeaningList.bind('all', this.render, this);

			MeaningList.fetch();
		}
		
		, enterMeaning: function() {
			this.entryView = new DataEntryView();
		}
		
		, addOne: function(meaning) {
			var view = new MeaningView({model: meaning});
      $('ul#meaningList').append(view.render().el);
		}
		
		, addAll: function() {
      MeaningList.each(this.addOne);
    }

		, render: function() {
				console.log('Rendering AppView');
				console.log(MeaningList.toJSON())
				$(this.clockView.el).html(this.clockView.render());
				this.addAll();
//				$(this.entryView.el).html(this.entryView.render());
				return this;
		}
	});
	
	var app = new AppView();
});
//var app = new AppRouter();
//Backbone.History.start();