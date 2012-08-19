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

function arrayRandomize(array) {
	return Math.floor(Math.random() * array.length)
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
		
		//, localStorage: new Backbone.LocalStorage("meaning-backbone")
		, url : "/clock/api"

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
			if(reverse == undefined) reverse=true;
			var index = cid.split('c')[1];
			var currentDay = new Date(this.getByCid(cid).get('date')).getDate();
			var lengthOfDay = this.postsIndex[currentDay];
			var prevSubtr = 0;
			for(var key in this.postsIndex) {
				if( key < currentDay ) {
					if(this.postsIndex[key]) {
						prevSubtr += this.postsIndex[key]
					}
				}
			}
			console.log('Subtracting ' + prevSubtr + ' from ' + index + ' with length ' + lengthOfDay)
			// Bad hack time
			if(index >= this.length*1.5) index = this.length;
			return parseInt( (index-prevSubtr) * (100 / lengthOfDay) );
			
		}
		, getDay: function(cid) {
				return parseInt( new Date(this.getByCid(cid).get('date')).getDate());
		}
		, postsPerDay: function() {
			var days = this.pluck('date');
			var array = [];
			for(var dates in days) {
				var index = new Date(days[dates]).getDate();
				if(!index) index = 0;
				//console.log('The index ' + index + "and array " + array[index] )
				if(array[index]) { array[index] += 1 }
				else { array[index] = 1; }
			}
			//console.log("the array:" + array)
			return array;
		}
		// This method states that amount of time left that could be meaningful.
		, timeLeftToday: function() {
			var today = new Date().getDate();
			var dates = this.pluck('date');
			var timeLeft = 24
			for(var key in dates) {
				if(new Date(dates[key]).getDate() == today) {
					timeLeft -= this.where({date : dates[key]})[0].get('duration');
				}
			}
			return timeLeft;
		}
		, meaningToday: function() {

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
		}

		, render: function() {
			//alert(window.clock.toString())
	  	$('#clockFace').html(window.clock);
			return this;
		}
	})

	/************************************************************
		State that invites the user to sign up
	************************************************************/

	var inviteView = Backbone.View.extend({
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
			app.enterMeaning();
		}
	})

	
	/************************************************************
		The response view is a critical (and mean) panel
	************************************************************/
	var responseView = Backbone.View.extend({
		el: $('#responseAnchor')
		, template: _.template($('#responsePane').html())
		, events: {
		'click':'render'	
		},
		initialize: function() {
			MeaningList.bind('change', this.render, this);
			this.render()
		}
		, render: function() {
			console.log("Response view is rendering")
			$(this.el).fadeOut(100).html(this.template({response: this.getResponse()})).fadeIn(700);
		}
		, getResponse: function() {
			var percentOfDayCompleted = ( (new Date().getHours() + 1) / 24  );
			var meaningfulHours = (24 - ( MeaningList.timeLeftToday() ) ) / percentOfDayCompleted  ;
			console.log("New meaningful hour test:" + meaningfulHours)
			var response;

			var none = [
			'You\'re not really using the app'
			,'What\'s meaningful to you?'
			,'What was the last thing you spent time on?'
			,'What was the last thing you just felt you had to do?'
			];
			var bad = [
			// This one is a weirdo hack to get back to the right time
			'So you\'ve only had ' + (meaningfulHours*percentOfDayCompleted) + ' today?'
			,'Your life seems dull'
			];
			var good = [
			'You\'re doing a lot to bring meaning into your life. But what are you missing?'
			,'Is work the only thing that\'s meaningful to you?'
			];
			var excellent = [
			'You seem to have a lot of purpose in your life'
			,'Are you sure all '+ (meaningfulHours*percentOfDayCompleted) +' those hours are meaningful?'
			];

			if( meaningfulHours <= 0 ) {
				response = none[arrayRandomize(none)];
			} else
			if( meaningfulHours >= 1 && meaningfulHours <= 4 ) {
				response = bad[arrayRandomize(bad)];		
			} else
			if( meaningfulHours >= 5 && meaningfulHours <= 16 ) {
				response = good[arrayRandomize(good)];		
			} else
			if( meaningfulHours >= 17) {
				response = excellent[arrayRandomize(excellent)];		
			} else
			if( meaningfulHours === undefined) {
				response = "Sorry, we couldn't get your rating";
			} else {
				response = "Something went wrong in judging you"
			}
			return response;
		}
		, done: function() {
			$(this.el).slideUp(100);
		}
	})
	
	
	/************************************************************
			Data Entry view appears and gets destroyed
	************************************************************/
	var DataEntryView = Backbone.View.extend({
		el: $('#entryFormAnchor')
		, enterTemplate: _.template($('#dataEntry').html())
		, failTemplate: _.template($('#noDataEntry').html())
		, noContentTemplate: _.template($('#noContentEntry').html())
		, events: {
			'click #submit' : 'saveOnClick'
			, 'keypress #meaningDuration' : 'saveOnEnter'
			, 'keypress #meaningEntry' : 'focusDuration'
		//	, 'keypress #meaningDuration' : 'saveEntry'
		}
		
		, initialize: function() {
//			$el.html(this.template);
			if(MeaningList.timeLeftToday() > 0) {
				$(this.el).hide().html(this.enterTemplate).trigger('entryViewDown').slideDown(700);
			} else {
				$(this.el).hide().html(this.failTemplate).slideDown(700);
			}
		}
		, saveOnClick: function(e) {
			this.save();
			}
		, saveOnEnter: function(e) {
			if(e.keyCode !== 13) return;
			this.save();
		}
		, save: function() {
			var proposedTime = MeaningList.timeLeftToday() - $('#meaningDuration').val();
			if(!$('#meaningDuration').val()) return;
			if(!$('#meaningEntry').val()) {
				$(this.el).slideUp(100).html(this.noContentTemplate).slideDown(700);
				return;
			} 
			if( proposedTime <= 0) {
					$(this.el).slideUp(100).html(this.failTemplate).slideDown(700);
					return;
			} else {
				MeaningList.create({
					_id: null
					, date: new Date()
					, meaning: $('#meaningEntry').val()
					, duration: $('#meaningDuration').val()
				});
				this.done();
			}
		}
		, focusDuration: function(e) {
			if(e.keyCode == 13)
				$('#meaningDuration').focus();
		}
		, done: function() {
			$(this.el).slideUp(100);
		}
	})
	
	/******************
	* View to a model *
	*******************/
var MeaningView = Backbone.View.extend({
	tagName: "li"
	, className: 'meaning-item'
 	, template: _.template($('#meaning-item').html())
 	, blankTemplate: _.template($('#blankMeaning').html())

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
		this.model.bind('change', this.setColour().render, this);
		this.model.bind('destroy', this.clear, this);
		this.setSize().setColour().hideOptions();
 	}

	, setColour: function() {
		var lightness = ( ( MeaningList.getRank(this.model.cid) / 100 ) * 50) + 10;
		var colour = MeaningList.getDay(this.model.cid) * 200;
		console.log("CID: " + this.model.cid + " Colour: " + colour + " Lightness: " + lightness);
		//console.log('color:' + colour);
		//console.log('Day:' + MeaningList.getDay(this.model.cid));

		$(this.el).css({
			'background-color':'hsl( ' + colour + ', 60%, ' //154,70%,n% original
				+  lightness  + '%)'
				, 'opacity': 1});
				
		return this;
	}
	, setSize: function() {
		$(this.el).css({
			'height': ((Math.log( this.model.get('duration')) * 50 ) + 60) + 'px auto!'
		})
		return this;
	}
	, showOptions: function() {
		$(this.el).find('.onHover').show();
		return this;
	}
	, hideOptions: function() {
		$(this.el).find('.onHover').hide();
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
			MeaningList.bind('refresh', this.render, this);
			MeaningList.fetch( {
				success: function(model, response) {
					console.log('Returned collection' + model);
				}
				, error: function(model, response) {
					console.log('Error' + JSON.stringify(model) + " err: " + JSON.stringify(response));
				}
			});
			
			var response = new responseView();
		}
		
		, enterMeaning: function() {
			if(!this.entryView)
				this.entryView = new DataEntryView();
			else {
				this.entryView.initialize();
			}
		}
		
		, addOne: function(meaning, iter) {
			var view = new MeaningView({model: meaning});
			$('ul#meaningList').prepend(view.render().el);
		}
		
		, addAll: function() {
    	  MeaningList.each(this.addOne, true);
    	  // This tosses out a reminder to post if you haven't posted today.
    	  if(MeaningList.postsPerDay()[new Date().getDate()] === undefined)
    	  	if(!invite) {
				var invite = new inviteView();
				invite.render();
			} else {
				invite.render()
			
			}
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
//Backbone.History.start();