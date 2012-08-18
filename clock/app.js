var express = require('express')
	, util = require('util')
  	, url = require('url')
  	, passport = require('passport')
  	, LocalStrategy = require('passport-local').Strategy;

var	mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost/gggclock', function(err) {
	if( err ) {	console.log(err); }
	else { console.log("Successful connection"); }
});

//Passport methods

// Authentication functions
function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
	for (var i = 0, len = users.length; i < len; i++) {
		var user = users[i];
		if (user.username === username) {
			return fn(null, user);
		}
	}
	return fn(null, null);
}

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login')
}


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    process.nextTick(function () {
      
      findByUsername(username, function(err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
      })
    });
  }
));

///Setup app and database



var app = module.exports = express.createServer();

//Database model
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var entrySchema = new Schema({ 
		'entry' : {
			userid: Number
			, id: ObjectId
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
	app.use(passport.initialize());
	app.use(passport.session());
//  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
//	app.use(express.basicAuth('gobble','gobble')); // Setup password
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});


// Routes
// Main page
app.get('/', function(req, res){
  res.render('index', {
    title: 'Clock'
  });
});

//Login structure
app.get('/login', function(req, res){
	res.render('login', { user: req.user, message: req.flash('error') });
	});

app.post('/login', 
	passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
		function(req, res) {
			res.redirect('/');
	});

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
	});

// Clock app
app.get('/clock/:userid?', ensureAuthenticated, function(req, res){
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
    , user: req.user
  });
});


app.get('/clock/api', ensureAuthenticated,  function(req, res) {
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
					, "id" : new ObjectId
					, "duration" : req.body.duration
					, "meaning" : req.body.meaning
					, "date" : new Date(req.body.date).getUTCDate
				};

			newEntry.save( function(err) {
				if(err) console.log("Error saving: " + err)
				res.json('Saved');
					});
});

// Modify meaning
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

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);