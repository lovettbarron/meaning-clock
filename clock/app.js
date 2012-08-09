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
			, date: Date
			, meaning: String
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

app.get('/clock/:userid?', function(req, res){
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
		else { console.log('Random user logged in, local only') }
	
  res.render('entry', {
		title: 'Clock'
    , user: req.session.userid
  });
});


app.get('/clock/api', function(req, res) {
	return Entry.find( function(err,doc) {
		if(!err){
			return res.send(doc);
		} else {
			return console.log(err)
		}
	})
});

app.post('/clock/api', function(req, res) {
			var newEntry = new Entry();
			newEntry.entry = {
					"user": req.session.userid
					, "duration" : req.body.duration
					, "meaning" : req.body.meaning
					, "date" : new Date()
				};

			newEntry.save( function(err) {
				if(err) console.log("Error saving: " + err)
				res.json('Saved');
					});
});

app.put('/clock/api/:id', function(req,res) {
	return Entry.findById( req.params.id, function(err,doc) {
		doc.meaning = req.body.meaning;
		doc.duration = req.body.duration;
		return doc.save(function(err) {
			if(!err) {
				console.log('Updated successfully: ' + req.params.id )
			} else {
				return console.log(err)
			}
		})
	})
});

app.delete('/clock/api/:id', function(req,res) {
	return Entry.findById( req.params.id, function(err,doc) {
		return doc.remove(function(err) {
			if(!err) {
				console.log('Deleted ' + req.params.id)
			} else {
				console.log(err)
			}
		})
	})
});


// Request account
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