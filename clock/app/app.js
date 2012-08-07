var express = require('express')
		, connect = require('connect')
		, jade = require('jade')
    , app = module.exports = express.createServer() // Init server
    , mongoose = require('mongoose')
    , mongoStore = require('connect-mongodb')
    , connectTimeout = require('connect-timeout')
    , stylus = require('stylus')
		, mailer = require('mailer')
    , util = require('util')
    , path = require('path')
    , models = require('./db.js')
		, db
		, Entry
		, User
		, LoginToken
		, Settings = { development: {}, test: {}, production: {} }
		, emails;

app.helpers(require('./helpers.js').helpers);
app.dynamicHelpers(require('./helpers.js').dynamicHelpers);

// Different server mode and their machinations
app.configure('development', function() {
  app.set('db-uri', 'mongodb://localhost/g3clock-dev');
  app.use(express.errorHandler({ dumpExceptions: true }));
  app.set('view options', {
    pretty: true
  });
});

app.configure('test', function() {
  app.set('db-uri', 'mongodb://localhost/g3clock-test');
  app.set('view options', {
    pretty: true
  });  
});

app.configure('production', function() {
  app.set('db-uri', 'mongodb://localhost/g3clock-production');
});

// Configure server. 
//Cookie and session parsers supposedly function better before methodOverride?
app.configure(function(){
  app.set('views', __dirname + '/../views');
  app.set('view engine', 'jade');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  app.use(express.bodyParser());
	app.use(express.cookieParser());
	app.use(express.session({ store: mongoStore(app.set('db-uri')), secret: '024493' }));
  app.use(express.methodOverride());
//  app.use(app.router);
  app.use(express.static(__dirname + '/../public'));
//	app.use(express.basicAuth('gobble','gobble')); // Setup password
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

// Set up the mongoose models elsewhere, encapsulate
models.defineModels(mongoose, function() {
  app.Entry = Entry = mongoose.model('Entry');
  app.User = User = mongoose.model('User');
  app.LoginToken = LoginToken = mongoose.model('LoginToken');
  db = mongoose.connect(app.set('db-uri'), function(err) {
		if( err ) {	console.log(err); }
		else { console.log("Successful connection"); }
	});
})


/*****************
Helper functions
*******************/
function arrayRandomize(array) {
	return Math.floor(Math.random() * array.length)
}

// Loads a user in
function loadUser(req, res, next) {
  if (req.session.user_id) {
    User.findById(req.session.user_id, function(err, user) {
      if (user) {
        req.currentUser = user;
        next();
      } else {
        res.redirect('/sessions/new');
      }
    });
  } else if (req.cookies.logintoken) {
    authenticateFromLoginToken(req, res, next);
  } else {
    res.redirect('/sessions/new');
  }
}


// Functions from NodePad to deal with persistent sessions,
// placed as a functioning component of loadUser()
function authenticateFromLoginToken(req, res, next) {
  var cookie = JSON.parse(req.cookies.logintoken); // Grabs token info

	// Pulls entry that fits the cookie from the mongo collection
  LoginToken.findOne({ email: cookie.email,
                       series: cookie.series,
                       token: cookie.token }, (function(err, token) {
		// If there isn't a token associated with that session, create a new session
    if (!token) {
      res.redirect('/sessions/new');
      return;
    }
		// If there is a token, search for the user account based on that token
    User.findOne({ email: token.email }, function(err, user) {
      if (user) {
				// Place results into active memory
        req.session.user_id = user.id;
        req.currentUser = user;
				// Return a new token, save it to the db, and write the value to a cookie.
        token.token = token.randomToken();
        token.save(function() {
          res.cookie('logintoken', token.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
          next();
        });
				// Otherwise redirect and create a new session
      } else {
        res.redirect('/sessions/new');
      }
    });
  }));
}





// Routes
app.get('/', function(req, res){
  res.render('index', {
    title: 'Gobble3'
  });
});

// Error handling, taken verbatim from NodePad
function NotFound(msg) {
  this.name = 'NotFound';
  Error.call(this, msg);
  Error.captureStackTrace(this, arguments.callee);
}

util.inherits(NotFound, Error);

app.get('/404', function(req, res) {
  throw new NotFound;
});

app.get('/500', function(req, res) {
  throw new Error('An expected error');
});

app.get('/bad', function(req, res) {
  unknownMethod(); // Returns a 500
});

// app.get('error', function(req, res, next) {
//   if (err instanceof NotFound) {
//     res.render('404.jade', { status: 404 });
//   } else {
//     next(err);
//   }
// });

if (app.settings.env == 'production') {
  app.error(function(err, req, res) {
    res.render('500.jade', {
      status: 500,
      locals: {
        error: err
      } 
    });
  });
}




// Default view, check for cookie
app.get('/clock', function(req,res) {
	if(req.session.userid === undefined) {
		res.redirect('/users/new')	
	} else {
		res.redirect('/clock/' + req.session.username)
	}
});

// User view
app.get('/clock/:userid', loadUser, function(req, res){
  res.render('user', {
		title: 'Clock'
    , user: req.currentUser
  });
});

// Get info
app.get('/clock/:year[0-9]+?/:month[0-9]+?/:day[0-9]+?.:format?', loadUser, function(req, res) {
	
	Entry.find({ user_id: req.currentUser.id },
                [], { sort: ['date', 'descending'] },
                function(err, documents) {
    documents = documents.map(function(d) {
      return { title: d.title, id: d._id };
    });
    res.render('entry.jade', {
      locals: { documents: documents, currentUser: req.currentUser }
    });
  });
	
	
	
	switch(req.params.format) {
		case 'json':
			res.send(doc.map(function(d) {
				return d.__doc;
			}));
			break;
		default:
			res.render('clock.jade')
	}
	
});

// Update info
app.post('/clock/:year[0-9]+?/:month[0-9]+?/:day[0-9]+?.:format?', function(req, res) {
	/*
	var newEntry = new Entry();
	newEntry.entry = {
			"userId": req.currentUser.id
			, "duration" : req.body.duration
			, "activity" : req.body.activity
			, "time" : new Date()
		};

	newEntry.save( function(err) {
		if(err) console.log("Error saving: " + err)
		res.json('Saved');
			});
			*/
		
		
		var e = new Entry(req.body);
	  e.user_id = req.currentUser.id;
	  e.save(function() {
	    switch (req.params.format) {
	      case 'json':
	        var data = e.toObject();
	        // TODO: Backbone requires 'id', but can I alias it?
	        data.id = data._id;
	        res.send(data);
	      break;

	      default:
	        req.flash('info', 'Meaningful time saved!');
	        res.redirect('/clock');
	    }
	  });
			
			
			
			
			
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
/*****************
// User management (Verbatim from NodePad)
*****************/
app.get('/users/new', function(req, res) {
  res.render('users/new.jade', {
    locals: { user: new User() }
  });
});

app.post('/users.:format?', function(req, res) {
  var user = new User(req.body.user);

  function userSaveFailed() {
    req.flash('error', 'Account creation failed');
    res.render('users/new.jade', {
      locals: { user: user }
    });
  }

  user.save(function(err) {
    if (err) return userSaveFailed();

    req.flash('info', 'Your account has been created');
//    emails.sendWelcome(user);

    switch (req.params.format) {
      case 'json':
        res.send(user.toObject());
      break;

      default:
        req.session.user_id = user.id;
        res.redirect('/clock');
    }
  });
});

/*****************
// Session management (Verbatim from NodePad)
*****************/
app.get('/sessions/new', function(req, res) {
  res.render('sessions/new.jade', {
    locals: { user: new User() }
  });
});

app.post('/sessions', function(req, res) {
  User.findOne({ email: req.body.user.email }, function(err, user) {
    if (user && user.authenticate(req.body.user.password)) {
      req.session.user_id = user.id;

      // Remember me
      if (req.body.remember_me) {
        var loginToken = new LoginToken({ email: user.email });
        loginToken.save(function() {
          res.cookie('logintoken', loginToken.cookieValue, { expires: new Date(Date.now() + 2 * 604800000), path: '/' });
          res.redirect('/clock');
        });
      } else {
        res.redirect('/clock');
      }
    } else {
      req.flash('error', 'Incorrect credentials');
      res.redirect('/sessions/new');
    }
  }); 
});

app.del('/sessions', loadUser, function(req, res) {
  if (req.session) {
    LoginToken.remove({ email: req.currentUser.email }, function() {});
    res.clearCookie('logintoken');
    req.session.destroy(function() {});
  }
  res.redirect('/sessions/new');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);