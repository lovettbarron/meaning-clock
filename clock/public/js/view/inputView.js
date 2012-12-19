var app = app || {};

$(function() {
	app.inputView = Backbone.View.extend({
		enterTemplate: _.template($('#dataEntry').html())
		, failTemplate: _.template($('#noDataEntry').html())
		, noContentTemplate: _.template($('#noContentEntry').html())

		, events: {
			'click .submit' : 'saveOnClick'
			, 'click .cancel' : 'done'
			, 'keypress .meaningDuration' : 'saveOnEnter'
			, 'keypress .meaningEntry' : 'focusDuration'

		//	, 'keypress #meaningDuration' : 'saveEntry'
		}
		
		, initialize: function() {
			//this.bind('click', this.saveOnClick, this)
			//this.events = _.extend({},app.AppView.prototype.events,this.events)
			this.bind('callInput', this.render, this);
			// //this.bind('click .submit', this.saveOnClick, this)
			// app.AppView.bind('click .submit', this.saveOnClick, this);
			// app.AppView.bind('click .cancel', this.done, this);
			// app.AppView.bind('keypress .meaningDuration', this.saveOnEnter, this);
			// app.AppView.bind('keypress .meaningEntry', this.focusDuration, this);
			// app.AppView.bind('keypress', this.checkCancel, this);
			this.render();
			this.delegateEvents();
		}
		, saveOnClick: function(e) {
			//alert('cur' + this.el);
			this.save();
			}
		, saveOnEnter: function(e) {
			if(e.keyCode !== 13) return;
			this.save();
		}

		, checkCancel: function(e) {
			if(e.keyCode !== 27) return;
			this.done
		}

		, save: function() {
			console.log("Saving");
			var proposedTime = app.MeaningList.timeLeftToday() - $('.meaningDuration').val();
			if(!$('.meaningDuration').val()) return;
			// Empty
			if(!$('.meaningEntry').val()) {
				$('.inputAnchor').slideUp(100).html(this.noContentTemplate).slideDown(700);
				return;
			} 
			// Over 24 hours
			if( proposedTime <= 0) {
					$('.inputAnchor').slideUp(100).html(this.failTemplate).slideDown(700);
					return;
				}
			// Allgood?
			app.MeaningList.create({
				_id: null
				, date: new Date()
				, meaning: $('.meaningEntry').val()
				, duration: $('.meaningDuration').val()
			});
			this.done();
		
		}

		, setColour: function() {
		var lightness = 70;
		var colour = parseInt( new Date().getDate()) * 8;
		$('#entry').css({
			'background-color':'hsl( ' + colour + ', 60%, ' //154,70%,n% original
				+  lightness  + '%)'
				, 'opacity': 1});
		return this;
		}

		, focusDuration: function(e) {
			if(e.keyCode == 13)
				$('.meaningDuration').focus();
		}

		, render: function() {
			console.log('Rendering input view');
			if(app.MeaningList.timeLeftToday() > 0) {
				$(this.el).hide().html( this.enterTemplate ).trigger('entryViewDown').slideDown(700);
			} else {
				$(this.el).hide().html( this.failTemplate ).slideDown(700);
			}
			this.setColour();
			return this;
		}
		, done: function() {
			console.log("Closing");
			$('#inputAnchor').slideUp(100);
		}

	})
	});