$(function(){

Backbone.View.prototype.close = function () {
    if (this.beforeClose) {
        this.beforeClose();
    }
    this.remove();
    this.unbind();
};

window.clock;
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
		window.clock = output + '<h3>You have ' + left + ' hours in the day left.</h3>';
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
		, validate: function(attrs) {
			if(isNaN(attrs.duration)) {
				return "Duration must be a number"
			}
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
		, sortDays: function() {
			
		}
		, colourStep: function() {
			var iteration = 1000 / this.length;
			return iteration;
		}
		, currentColour: function(cid) {
			var _cid = parseInt(cid);
			return parseInt( _cid * (1000 / this.length) );
		}
		, clearAll: function() {
			this.reset();
		}
		, comparator: function(meaning) {
			return meaning.get('date');
		}
	})
	
	var MeaningList = new MeaningCollection;

	// MeaningList.create({
	// 	_id: null
	// 	,date: new Date()
	// 	, meaning: "Meaning Test"
	// 	, duration: 1
	// 	}
	// 	, {
	// 		_id: null
	// 		,date: new Date()
	// 		, meaning: "Another test"
	// 		, duration: 2
	// 	}
	// )
//	fakeData.save();


	/************************************************************
					The animating clock that doesn't seem to animate
	************************************************************/
	var ClockView = Backbone.View.extend({
		el: $('#clockFace')
		, events: {
		}
	
		, initialize: function() {
			clockSetup();
	  	$(this.el).html(window.clock.toString());
		}
		
		, render: function() {
	  	$(this.el).html(window.clock.toString());
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
			, 'keypress #durationEntry' : 'saveOnEnter'
			, 'keypress #meaningEntry' : 'focusDuration'
		//	, 'keypress #meaningDuration' : 'saveEntry'
		}
		
		, initialize: function() {
			$(this.el).html(this.template);
		}
		, saveEntry: function(e) {
		//	if(!this.input.val()) return;
			MeaningList.create({
					_id: null
					, date: new Date()
					, meaning: $('#meaningEntry').val()
					, duration: $('#meaningDuration').val()
				});
	     	this.done();
		}
		, saveOnEnter: function(e) {
			if(e.keyCode !== 13) return;
		//	if(!this.input.val()) return;
			MeaningList.create({
				_id: null
				, date: new Date()
				, meaning: $('#meaningEntry').val()
				, duration: $('#meaningDuration').val()
			});
     	this.done();
		}
		, focusDuration: function(e) {
			if(e.keyCode == 13)
				$('#meaningDuration').focus();
		}
		, done: function() {
			this.remove();
		}
	})
	
	/******************
	* View to a model *
	*******************/
 	var MeaningView = Backbone.View.extend({
		tagName: "li"

	 	, template: _.template($('#meaning-item').html())

	 	, events: {
	 		'click .delete' : 'remove'
			, 'dblclick' : 'edit'
			, 'mouseenter' : 'showOptions'
			, 'mouseleave' : 'hideOptions'
			, 'tap' : 'showOptions'
      , 'click a.destroy' : 'clear'
      , 'keypress .edit'  : 'updateOnEnter'
      , 'blur .edit'      : 'close'
	 	}

	 	, initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
			this.setSize().setColour().hideOptions();
	 	}

	 	, remove: function() {
	 		alert('Delete this meaningful time?', function() {
	 			this.destroy();
	 		})
	 	}	
		, setColour: function() {
			var colour = MeaningList.currentColour(this.model.cid);
			$(this.el).css({
					'background-color':'hsl(' + (143+colour*10)+ ', 65%, 53%)',
					'opacity': 1});
			return this;
		}
		, setSize: function() {
			$(this.el).css({
				'height': (10 * Math.log( this.model.get('duration') + 1)) + 60
			})
			return this;
		}
		, showOptions: function() {
			$(this.el).find('.delete').show();
			return this;
		}
		, hideOptions: function() {
			$(this.el).find('.delete').hide();
			return this;
		}
		, edit: function() {
			$(this.el).addClass("editing");
      this.input.focus();
		}
    , close: function() {
      var value = this.input.val();
      if (!value) this.clear();
      this.model.save({meaning: value});
      $(this.el).removeClass("editing");
    }
		, clear: function() {
      this.model.clear();
		}
    , updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    }
		, remove: function() {
			this.model.destroy();
		}
	 	, render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.input = this.$('.edit');
      return this;
	 	}
 })
	
	/************************************************************
					Primary application view and rendering
	************************************************************/
	var AppView = Backbone.View.extend({
		el: $("#meaningClock")
		
		, events: {
			'click .addOne' : 'enterMeaning'
			, 'click .removeAll' : 'resetCollection'
		}
	
		, initialize: function() {
			this.clockView = new ClockView();
			
	    MeaningList.bind('add', this.addOne, this);
      MeaningList.bind('reset', this.addAll, this);
      MeaningList.bind('all', this.render, this);
			

			MeaningList.fetch();
		}
		
		, enterMeaning: function() {
			if(!this.entryView)
				this.entryView = new DataEntryView();
			else {
				this.entryView.initialize();
			}
		}
		
		, addOne: function(meaning) {
			var view = new MeaningView({model: meaning});
      $('ul#meaningList').prepend(view.render().el);
		}
		
		, addAll: function() {
      MeaningList.each(this.addOne);
    }

		, resetCollection: function() {
	 			alert('Remove test data?', function() {
					MeaningList.reset();
	 			})
		}
		
		, render: function() {
				console.log('Rendering AppView');
				return this;
		}
	});
	
	var app = new AppView();
});
//var app = new AppRouter();
//Backbone.History.start();