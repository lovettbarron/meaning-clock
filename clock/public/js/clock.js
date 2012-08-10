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
		window.clock = output;
		// + '<h3>You have ' + left + ' hours in the day left.</h3>';
  	$('#clockFace').html(window.clock);
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
				console.log("Duration must be a number")
				return "Duration must be a number"
			}
		}

	});


	var MeaningCollection = Backbone.Collection.extend({
		
		model: MeaningModel
		
		
		, localStorage: new Backbone.LocalStorage("meaning-backbone")
		//, url:"./act/",
//		, postsIndex: []
		, initialize: function () {
		}
		, populateIndex: function() {
			
			this.postsIndex = this.postsPerDay();
			return this;
		}
		, sortDays: function() {
			
		}
		, colourStep: function() {
				var iteration = 1000 / this.length;
				return iteration;
		}
		, getRank: function(cid,reverse) {
			// Okay, I think this is a not great hack, but not sure how to do preprocessing
			// I'm checking to see if the thing has been checked and then populates the array.
			// There should be other checking too, like for additions and re-rendering and such.
			if(!this.postsIndex) this.populateIndex();
			if(reverse == undefined)
				reverse=true;
			var index = cid.split('c')[1];
			var lengthOfDay = this.postsIndex[new Date(this.getByCid(cid).get('date')).getDate()];
			var prevSubtr = 0;
			for(var key in this.postsIndex) {
				if(this.postsIndex[key]) {
					prevSubtr += this.postsIndex[key]
				}
			}
			console.log('Subtracting ' + prevSubtr + ' from ' + index + ' with length ' + lengthOfDay)
			/*
			if(index > this.length+1) index = this.length+1;
			console.log(index);
			// This reverses the colour index
			return parseInt( index * (100 / this.length ) );*/
			//if(reverse) index = (this.length+1) - index+1;
			
			return parseInt( (prevSubtr-index) * (100 / lengthOfDay));
			
		}
		, getDay: function(cid) {
		//		console.log("This!" + parseInt( new Date(this.getByCid(cid).get('date')).getDay()))
				return parseInt( new Date(this.getByCid(cid).get('date')).getDate());
		}
		, clearAll: function() {
			this.reset();
		}
		, postsPerDay: function() {
			var days = this.pluck('date');
			var array = [];
			for(var dates in days) {
				var index = new Date(days[dates]).getDate();
				if(!index) index = 0;
				console.log('The index ' + index + "and array " + array[index] )
				if(array[index]) { array[index] += 1 }
				else { array[index] = 1; }
			}
			console.log("the array:" + array)
			return array;
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
		}
		
		, render: function() {
			//alert(window.clock.toString())
	  	$('#clockFace').html(window.clock);
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
			'click #submit' : 'saveOnClick'
			, 'keypress #meaningDuration' : 'saveOnEnter'
			, 'keypress #meaningEntry' : 'focusDuration'
		//	, 'keypress #meaningDuration' : 'saveEntry'
		}
		
		, initialize: function() {
//			$el.html(this.template);
			$(this.el).hide().html(this.template).slideDown(700);
		}
		, saveOnClick: function(e) {
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
			$(this.el).slideUp(100);
//			this.remove();
		}
	})
	
	/******************
	* View to a model *
	*******************/
 		var MeaningView = Backbone.View.extend({
		tagName: "li"
		, className: 'meaning-item'
	 	, template: _.template($('#meaning-item').html())

	 	, events: {
	 		'click a.delete' : 'remove'
			, 'dblclick' : 'edit'
			, 'mouseenter' : 'showOptions'
			, 'mouseleave' : 'hideOptions'
			, 'tap' : 'showOptions'
      , 'keypress .edit'  : 'updateOnEnter'
      , 'blur .edit'      : 'close'
	 	}

	 	, initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.clear, this);
			this.setSize().setColour().hideOptions();
	 	}
	
		, blankCanvas: function() {
			$(this.el).html('Why not do something meaningful today so you can post something!')
		}

		, setColour: function() {
			var colour = MeaningList.getRank(this.model.cid);
			console.log('color:' + colour)
			console.log('Day:' + MeaningList.getDay(this.model.cid));
			$(this.el).css({
				'background-color':'hsl( ' + (MeaningList.getDay(this.model.cid) * 255) + ', 70%, '
//				'background-color':'hsl( 154, 70%, '
					+ (((MeaningList.getRank(this.model.cid, false) / 100) * 50)+10) +'%)'
//					, 'color': 'hsl( ' + (MeaningList.currentColour(this.model.cid) / 100) * 255 + '%, 100%, 100%)'
					, 'opacity': 1});
			return this;
		}
		, setSize: function() {
			$(this.el).css({
				'height': ((Math.log( this.model.get('duration'))*50) + 60) + 'px auto!'
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
			alert('Triggering edit mode')
			$(this.el).addClass("editing");
      this.input.focus();
		}
    , close: function() {
      var value = this.input.val();
      if (!value) this.clear();
      this.model.save({meaning: value});
      $(this.el).removeClass("editing").hide();
    }
    , updateOnEnter: function(e) {
      if (e.keyCode == 13) this.close();
    }
		, remove: function() {
			this.model.destroy();
		}
		, clear: function() {
			$(this.el).slideUp(300);
		}
	 	, render: function() {
      this.$el.hide().html(this.template(this.model.toJSON())).slideDown();
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