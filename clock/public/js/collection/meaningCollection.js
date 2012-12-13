var app = app || {};

$(function() {
	app.MeaningCollection = Backbone.Collection.extend({
		
		model: app.MeaningModel
		
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

		, totalMissed: function() {
			this.without.apply( this, this.completed() 
		}

		, totalEntry: function() {
			return this.
		}

		, totalDay: function() {
			return this.pluck('date');.length();
		}

		, colourStep: function() {
				var iteration = 1000 / this.length;
				return iteration;
		}
		, getRank: function(cid,reverse) {
			// Okay, I think this is a not great hack, but not sure how to do preprocessing
			// I'm checking to see if the thing has been checked and then populates the array.
			// There should be other checking too, like for additions and re-rendering and such.
			// if(!this.postsIndex) this.populateIndex();
			// if(reverse == undefined) reverse=true;
			// var index = cid.split('c')[1];
			// var currentDay = new Date(this.getByCid(cid).get('date')).getDate();
			// var lengthOfDay = this.postsIndex[currentDay];
			// var prevSubtr = 0;
			// for(var key in this.postsIndex) {
			// 	if( key < currentDay ) {
			// 		if(this.postsIndex[key]) {
			// 			prevSubtr += this.postsIndex[key]
			// 		}
			// 	}
			// }
			// console.log('Subtracting ' + prevSubtr + ' from ' + index + ' with length ' + lengthOfDay)
			// // Bad hack time
			// if(index >= this.length*1.5) index = this.length;
			// //return parseInt( (index-prevSubtr) * (100 / lengthOfDay) );
			// return Math.abs(prevSubtr - index) / lengthOfDay;
			return .6;
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
	
	
});