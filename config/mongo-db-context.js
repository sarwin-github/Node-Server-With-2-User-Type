const session    = require('express-session');
const mongoose   = require('mongoose');
const mongoStore = require('connect-mongo')(session);

// Local connection
let mongoConnectionLocal = {	
	'url': `mongodb://127.0.0.1:27017/my-database`
};

// Development database from mongolab
let mongoConnectionOnline = {
	'url': `mongodb://${process.env.MLabDBUser}:${process.env.MLabDBPassword}@${process.env.MLabDB}`
};


//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Session storage and database configuration 
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports.pickEnv = (env, app) => {
	mongoose.Promise = global.Promise;
	switch (env) {
	    case 'dev':
	    	let dev_options = { useMongoClient: true }

	    	app.set('port', process.env.PORT || 5050);
	        mongoose.connect(mongoConnectionOnline.url, dev_options,
	        	err => { if(err) { console.log(err); }}); 
	        break;
		case 'local':
			let local_options = {
				auth: { authdb: 'admin'},
				user: process.env.MongoDBLocalUser,
				pass: process.env.MongoDBLocalPassword,
				useMongoClient: true
			}

	    	app.set('port', process.env.PORT || 5050);
	        mongoose.connect(mongoConnectionLocal.url, local_options,   
	        	err => { if(err) { console.log(err); }});
			break;
	};

	// Set session and cookie max life, store session in mongo database
	app.use(session({
		secret : process.env.sessionKey,    
		httpOnly: true,
		resave : true,
	  	saveUninitialized: false, 
		store  : new mongoStore({ mongooseConnection: mongoose.connection }),
		cookie : { maxAge: 60 * 60 * 1000 }
	}));
};

