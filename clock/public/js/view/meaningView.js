var app = app || {};

$(function() {
	app.MeaningView = Backbone.View.extend({
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
		var lightness = 70//( MeaningList.getRank(this.model.cid) );
		var colour = app.MeaningList.getDay(this.model.cid) * 8;
		//console.log("CID: " + this.model.cid + " Colour: " + colour + " Lightness: " + lightness);
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
 		this.output = this.model.toJSON();

 		// Date namer thing
 		if( new Date(this.output.date).getDay() === new Date().getDay() )
 			this.output.date = "Todayat " + (new Date(this.output.date).getHours())  + "00 ish";
 		else if ( new Date(this.output.date).getDay() === (new Date().getDay()) - 1)
 			this.output.date = "Yesterday at " + (new Date(this.output.date).getHours())  + "00 ish";
 		else
 			this.output.date = '' + (new Date(this.output.date).toDateString());

		this.$el.hide().html(this.template(this.output)).slideDown();
		this.input = this.$('.edit');
		return this;
 	}
 })
	});