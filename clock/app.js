var express = require('express')
	, util = require('util')
  	, url = require('url')
  	, passport = require('passport')
  	, LocalStrategy = require('passport-local').Strategy;

var	mongoose = require('mongoose')
	, bcrypt = require('bcrypt')
	, mongooseTypes = require("mongoose-types");

	mongooseTypes.loadTypes(mongoose);
	


var db = mongoose.connect('mongodb://localhost/g3clock', function(err) {
	if( err ) {	console.log(err); }
	else { console.log("Successful connection"); }
});


///Setup app and database



var app = module.exports = express.createServer();

//Database model
var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var entrySchema = new Schema({
			userid: ObjectId
			, date: Date
			, meaning: String
			, duration: Number
	}), entry;

var Entry = mongoose.model('entry', entrySchema,'entry');

/*********************
** The user Schema! **
*********************/
var UserSchema = new Schema({
  name: { type: String, unique: true },
  email: { type: String, unique: true },
  //password: { type: String },
  // Password
  /* This is the good way */
  salt: { type: String, required: true },
  hash: { type: String, required: true }
  
});
/* Again, the good way skipped over */
UserSchema.virtual('password').get(function () {
  return this._password;
}).set(function (password) {
  this._password = password;
  var salt = this.salt = bcrypt.genSaltSync(10);
  this.hash = bcrypt.hashSync(password, salt);
});
/*
UserSchema.virtual('password').get( function() {
	return this._password;
}).set( function(password) {
	this._password = password;
});*/

UserSchema.method('checkPassword', function (password, callback) {
  bcrypt.compare(password, this.hash, callback);
});

UserSchema.static('authenticate', function(name,password,callback) {
	console.log("Authenticating:" + name);
	this.findOne( {name: name}, function(err,user) {
		console.log("find err:" + err + " user " + user);
		if(err) return callback(err);
		if(!user) return callback(null, false);
		console.log("Checking " + name + " with " + password);
		user.checkPassword(password, function(err, passwordCorrect) {
			console.log("auth err:" + err);
			if(err) return callback(err);
			if(!passwordCorrect) return callback(null, false);
			return callback(null,user);
		})
	})
})

/*
UserSchema.static('authenticate', function (name, password, callback) {
  this.findOne({ name: name }, function(err, user) {
    if (err)
      return callback(err);

    if (!user)
      return callback(null, false);

    user.checkPassword(password, function(err, passwordCorrect) {
      if (err)
        return callback(err);

      if (!passwordCorrect)
        return callback(null, false);

      return callback(null, user);
    });
  });
});*/

var User = mongoose.model('user', UserSchema,'user');


app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.static(__dirname + '/public'));
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('024493'));
	app.use(express.session({ secret: '024493' }));
//	app.use(express.basicAuth('gobble','gobble')); // Setup password
  	app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
	app.use(passport.initialize());
	app.use(passport.session());
	app.use(app.router);
});


//Passport methods

passport.use(new LocalStrategy(
 	function(username, password, done) {
 		console.log("Looking for " + username + " with pass" + password);
 		User.findOne({ name: username}, function (err, user) {
 			console.log('user! ' + JSON.stringify(user));
			if(err) console.log(err);
 			if(!user) {
 				app.redirect('/login');
 				done(err,null);
 				}
 			User.authenticate(username,password, function(err,user) {
 				 done(err, user) 
 				}) ;
	 		
 		});
 	}
 ));


// Authentication functions
function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login')
}

passport.serializeUser(function(user, done) {
	console.log("Serializing user" + user);
  	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("Deserializing user" + id);
  User.findOne( {'_id':id}, function (err, user) {
  	console.log('Deserialized user ' + user);
    done(err, user);
  });
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
	res.render('index', {
		title: 'Clock'
	});
	//res.render('login', { user: req.user, message: req.flash('error') });
	});

app.post('/login', 
	passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
		function(req, res) {
			res.redirect('/clock');
	});

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
	});

// Clock api
app.get('/clock', ensureAuthenticated, function(req, res){
	//Calls userfile
	// var query = Request.find( {'request.username': req.session.userid } );
	// 	query.exec(function(err,doc) {
	// 		req.session.id = doc._id
	// 		req.session.userid = doc.userid;
	// 	});
	
  res.render('entry', {
	title: 'Clock'
    , user: req.user
  });
});


app.get('/clock/api', ensureAuthenticated, function(req, res) {
	console.log('Looking for ' + req.user._id)
	return Entry.find({ 'userid': req.user._id }, function(err,doc) {
		console.log('Found stuff!' + doc );
		if(!err){
			return res.send(doc);
		} else {
			return console.log(err)
		}
	})
});

app.post('/clock/api', ensureAuthenticated, function(req, res) {
	var newEntry = new Entry();
	newEntry.userid = req.user._id;
	newEntry.duration = req.body.duration;
	newEntry.meaning = req.body.meaning;
	newEntry.date = new Date(req.body.date);

	newEntry.save( function(err) {
		if(err) console.log("Error saving: " + err)
		res.json('Saved');
			});
});

// Modify meaning
app.put('/clock/api/:id',ensureAuthenticated, function(req,res) {
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

app.delete('/clock/api/:id',ensureAuthenticated, function(req,res) {
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

app.post('/request', function(req, res) {
/*			var newEntry = new Request();
			newEntry.request = {
					"email": req.body.email
					, "username": req.body.username
				};

			newEntry.save( function(err) {
				if(err) console.log("Error saving: " + err)
				res.json('Saved');
					}); */
	var newUser = new User();
	newUser.name = req.body.name;
	newUser.email = req.body.email;
	newUser.password = req.body.password;
	newUser.save( function(err) {

		if(err) {
			res.send('We had some trouble saving your account!')
			console.log("Error saving new user: " + err);
		}
	});
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);