var app = app || {};

$(function() {
	app.inputView = Backbone.View.extend({
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
			console.log("Trigering input")
			if(app.MeaningList.timeLeftToday() > 0) {
				$(this.el).hide().html(this.enterTemplate).trigger('entryViewDown').slideDown(700);
			} else {
				$(this.el).hide().html(this.failTemplate).slideDown(700);
			}
			this.setColour().render();
		}
		, saveOnClick: function(e) {
			this.save();
			}
		, saveOnEnter: function(e) {
			if(e.keyCode !== 13) return;
			this.save();
		}
		, save: function() {
			var proposedTime = app.MeaningList.timeLeftToday() - $('#meaningDuration').val();
			if(!$('#meaningDuration').val()) return;
			if(!$('#meaningEntry').val()) {
				$(this.el).slideUp(100).html(this.noContentTemplate).slideDown(700);
				return;
			} 
			if( proposedTime <= 0) {
					$(this.el).slideUp(100).html(this.failTemplate).slideDown(700);
					return;
			} else {
				app.MeaningList.create({
					_id: null
					, date: new Date()
					, meaning: $('#meaningEntry').val()
					, duration: $('#meaningDuration').val()
				});
				this.done();
			}
		}
		, setColour: function() {
		var lightness = 70//( MeaningList.getRank(this.model.cid) );
		var colour = parseInt( new Date().getDate()) * 8;
		
		$('#entry').css({
			'background-color':'hsl( ' + colour + ', 60%, ' //154,70%,n% original
				+  lightness  + '%)'
				, 'opacity': 1});
				
		return this;
		}
		, focusDuration: function(e) {
			if(e.keyCode == 13)
				$('#meaningDuration').focus();
		}
		, done: function() {
			$(this.el).slideUp(100);
		}
	})
	});