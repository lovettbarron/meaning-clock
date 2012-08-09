var express = require('express')
 		, util = require('util')
  	, url = require('url');

var	mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost/gggclock', function(err) {
	if( err ) {	console.log(err); }
	else { console.log("Successful connection"); }
});

var app = module.exports = express.createServer();

//Database model
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var entrySchema = new Schema({ 
		'entry' : {
			user: Number
			, time: Date
			, activity: String
			, duration: Number
	}}), entry;

var Entry = mongoose.model('entry', entrySchema,'entry');

var requestSchema = new Schema({ 
		'request' : {
			username: String
			, email: String
			, meaning: 0
			
	}}), request;

var Request = mongoose.model('request', requestSchema,'request');

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ secret: '024493' }));
//  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
//	app.use(express.basicAuth('gobble','gobble')); // Setup password
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});


// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Clock'
  });
});

app.get('/clock/:userid', function(req, res){
	//Calls userfile
	var query = Request.find( {'request.username': req.session.userid } );
		query.exec(function(err,doc) {
			req.session.id = doc._id
			req.session.userid = doc.userid;
		});
		
	// original hardcoded
	if( req.params.userid == 'zahra' ) {
		req.session.userid = 1;
		console.log('Zahra is logged in');
		}
	else if( req.params.userid == 'andrew' ) { 
		req.session.userid = 0;
		console.log('Andrew is logged in');
		}
	else if( req.params.userid == 'ayla' ) { 
		req.session.userid = 2;
		console.log('Ayla is logged in');
		}
	else if( req.params.userid == 'heather' ) { 
		req.session.userid = 3;
		console.log('Heather is logged in');
		}
//	else { req.session.userid = 0; }
	
  res.render('entry', {
		title: 'Clock'
    , user: req.session.userid
  });
});

app.post('/feedback', function(req, res) {
	var total = 0;
	var count = 0;
	var feedback = [];
	var todayDate = new Date();
	// Old version of meaning count
	/*
	for( var key in req.session.activity) {
		var todayDate = req.session.activity[key].time;
		var currentDate = new Date().getDate();
		if( parseInt(todayDate.substr(8,2)) === parseInt(currentDate) ) {
			var count = count + req.session.activity[key].duration;
		}	
	}*/
	
	for( var key in req.session.days) {
		total = req.session.days[key].today;
		var currentDate = new Date().getDate();
		if( currentDate === req.session.activity[req.session.days[key]].time) {
			count = req.session.activity[req.session.days[key]].duration;
			}
//		count.push(req.session.days[key].today);
		req.session.day[key].feedback = getDailyFeedback(req.session.days[key].today);
	}
	
	
	
	
	var response = { count : count, total: total, feedback: 'Testing feedback' };
	res.json(response);
});

app.post('/act/:year?/:month?/:day?', function(req, res) {
	var response = {};
	var getDate = {}
	getDate.year = req.params.year;
	getDate.month = req.params.month;
	getDate.day = req.params.day
	req.session.activity = [];
	req.session.days = [];
	
	//Pulls data from mongo
	var query = Entry.find( {'entry.user': req.session.userid } );
	 query.sort( 'entry.time', -1 )
			.limit(50)
			.exec(function(err,doc) {
					if(err) console.log("Err retrieving:" + err)
					if( doc !== undefined ) {
						for( var key in doc){
							if( doc.hasOwnProperty(key) ) {
								console.log(doc[key].entry);
								req.session.activity.push(doc[key].entry);
								}
							}
						//Populate reference array of keys
						for( var key in req.session.activity) {
							if(req.session.activity[key].time.getDay()) {
								var check = false;
								for(var dayKey in req.session.days) {
									if(req.session.days[dayKey] !== undefined) {
										check = true;
									}
									req.session.days[dayKey].push(key)
								}
							}
						}
						// Counts the number of meaningful hours
						for( var key in req.session.days) {
							var meaningCount = 0;
							for( var dayKey in req.session.days[key]) {
								meaningCount = req.session.activity[dayKey].duration;
							}
							req.session.days[key].today = meaningCount;
						}
						
						response = req.session.activity;
						
						res.json( response );
					} // Ends check for entries
			}); // End query
});

app.post('/entry', function(req, res) {
			var newEntry = new Entry();
			newEntry.entry = {
					"user": req.session.userid
					, "duration" : req.body.duration
					, "activity" : req.body.activity
					, "time" : new Date()
				};

			newEntry.save( function(err) {
				if(err) console.log("Error saving: " + err)
				res.json('Saved');
					});
});

app.post('/request', function(req, res) {
			var newEntry = new Request();
			newEntry.request = {
					"email": req.body.email
					, "username": req.body.username
				};

			newEntry.save( function(err) {
				if(err) console.log("Error saving: " + err)
				res.json('Saved');
					});
});



function getDailyFeedback(rating) {
	var none = [
	'You\'re not really using the app'
	,'What\'s meaningful to you?'
	,'What was the last thing you spent an hour doing.'
	,'how do you think your parents felt?'
	,'what do you feel like when someone appraises you?'
	];
	var bad = [
	'how does that make you feel?'
	,'what did you see today?'
	,'do you think that was a choice?'
	,'how do you think your parents felt?'
	,'what do you feel like when someone appraises you?'
	];
	var good = [
	'how does that make you feel?'
	,'what did you see today?'
	,'do you think that was a choice?'
	,'how do you think your parents felt?'
	,'what do you feel like when someone appraises you?'
	];
	var excellent = [
	'how does that make you feel?'
	,'what did you see today?'
	,'do you think that was a choice?'
	,'how do you think your parents felt?'
	,'what do you feel like when someone appraises you?'
	];
	
	if( rating <= 0 ) {
		response = none[arrayRandomize(none)];
	} else
	if( rating >= 1 && rating <= 8 ) {
		response = bad[arrayRandomize(bad)];		
	} else
	if( rating >= 9 && rating <= 16 ) {
		response = good[arrayRandomize(good)];		
	} else
	if( rating >= 17) {
		response = excellent[arrayRandomize(excellent)];		
	} else
	if( rating === undefined) {
		response = "Sorry, we couldn't get your rating";
	}
	return response;
}

function arrayRandomize(array) {
	return Math.floor(Math.random() * array.length)
}

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);