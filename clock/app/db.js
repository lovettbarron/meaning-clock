var crypto = require('crypto')
	, Entry
	, User
	, LoginToken;

//Database func
function validatePresenceOf(value) {
  return value && value.length;
}

function extractKeywords(text) {
  if (!text) return [];

  return text.
    split(/\s+/).
    filter(function(v) { return v.length > 2; }).
    filter(function(v, i, a) { return a.lastIndexOf(v) === i; });
}

//Define Models
function defineModels(mongoose, fn) {
	//Database model
	var Schema = mongoose.Schema
	  , ObjectId = Schema.ObjectId;


	//Basic entry schema
	var Entry = module.exports = new Schema({ 
				userId: ObjectId
				, time: { type: Date, index: {unique: true } }
				, activity: { type: String, validate: [ validatePresenceOf, 'You must have done something meaningful?'] }
				, duration: { type: Number, validate: [ validatePresenceOf, 'You spent an hour or more doing this?'] }
				, keywords: [String]
		}), entry;
		
  Entry.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  Entry.pre('save', function(next) {
    this.keywords = extractKeywords(this.activity);
    next();
  });

	// Reference for building: http://dailyjs.com/2011/02/07/node-tutorial-12/
	// User model
	var User = new Schema({
				userId: ObjectId
				, username: { type: String, validate: [ validatePresenceOf, 'This user exists' ], index: {unique: true} }
				, email: { type: String, validate: [ validatePresenceOf, 'An email is required to continue'] }
				, password_hash: String
				, salt : String
			
		}), user;

  User.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  User.virtual('password')
    .set(function(password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashed_password = this.encryptPassword(password);
    })
    .get(function() { return this._password; });

	User.pre('save', function(next) {
		if( !validatePresenceOf(this.password)) {
			next(new Error('Wrong Password'));
		} else {
			next();
		}
	});

	User.method('authenticate', function(plainText) {
		return this.encryptPassword(plainText) === this.hashed_password;
	});

	User.method('makeSalt', function() {
		return Math.round((new Date().valueOf() * Math.random())) + '';
	}); 

	User.method('encryptPassword', function(password) {
		return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
	});

// Login tokens, also taken from nodepad
	LoginToken = new Schema({
	  email: { type: String, index: true },
	  series: { type: String, index: true },
	  token: { type: String, index: true }
	});

	LoginToken.method('randomToken', function() {
	  return Math.round((new Date().valueOf() * Math.random())) + '';
	});

	LoginToken.pre('save', function(next) {
	  // Automatically create the tokens
	  this.token = this.randomToken();

	  if (this.isNew)
	    this.series = this.randomToken();

	  next();
	});

	LoginToken.virtual('id')
	  .get(function() {
	    return this._id.toHexString();
	  });

	LoginToken.virtual('cookieValue')
	  .get(function() {
	    return JSON.stringify({ email: this.email, token: this.token, series: this.series });
	  });

	var LoginToken = mongoose.model('LoginToken', LoginToken, 'loginToken');
	var Entry = mongoose.model('Entry', Entry,'entry');
	var User = mongoose.model('User', User,'user');
	fn();
}

exports.defineModels = defineModels;