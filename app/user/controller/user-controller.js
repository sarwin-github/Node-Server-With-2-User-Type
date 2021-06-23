const jwt      = require('jsonwebtoken');
const passport = require("passport");
const User     = require("../model/users");
const async    = require('async');
const randtoken = require('rand-token');
const refreshTokens = {} 

// Get Login Form
module.exports.getLogin = (req, res) => {
	res.status(200).json({ 
		success: true, 
		error  : req.flash('error'),
		message:'Successfully fetched form for login.'
	});
}

// Authenticate User
module.exports.postLogin = (req, res, next) => {
	passport.authenticate('user-login', {session: false}, (err, user, info) => {
		if (err) { 
			return res.status(200).json({
				error : err,
				message : "Error logging in the user"
			});
		} 
		if (!user) {
			return res.status(200).json({
				error : info.message,
				message : "Error logging in the user"
			});
		} 

		if(!err && user){
			req.login(user, {session: false}, (err) => {
				if (err) {
					res.send(err);
				}

				// user data
				const userData = {
					_id: user._id,
					user_type: "User",
					name: user.name,
					email: user.email
				}

				const token = jwt.sign(userData, process.env.jwt_secret, { expiresIn: 300 });
				
				// set refresh token
				const refreshToken = randtoken.uid(256);

				refreshTokens[refreshToken] = userData.email;

				//console.log(userData, refreshTokens);

				return res.status(200).json({
					success : true,
					message : 'You successfully logged in your account',
					user    : userData,
					token   : token, 
					refreshToken: refreshToken
				});
			});
		}
	})(req, res, next);
}


/* Get signup form */
module.exports.getSignupForm = (req, res) =>{
	res.status(200).json({ 
		success: true, 
		error  : req.flash('error'),
		message:'Successfully fetched form for signup.'
	});
}

/* Create new user */
module.exports.signUp = (req, res) => {
	passport.authenticate('user-signup', {session: false}, (err, user, info) => {
		if (err) { 
			return res.status(200).json({
				error : err,
				message : "Error creating a new user"
			});
		} 

		if (!user) {
			return res.status(200).json({
				error : `Error creating a new user. ${ (info && info.length ? info.join(' ') : "Missing Credentials") }`,
				message : "Error creating a new user"
			});
		} 

		if(!err && user){
			req.login(user, {session: false}, (err) => {
				if (err) res.send(err);

				// user data
				const userData = {
					_id: user._id,
					user_type: "User",
					name: user.name,
					email: user.email
				}

				// set access token
				const token = jwt.sign(userData, process.env.jwt_secret, { expiresIn: 300 });
				
				// set refresh token
				const refreshToken = randtoken.uid(256);
				refreshTokens[refreshToken] = userData.email;

				return res.status(200).json({
					success : true,
					message : 'You successfully logged in your account',
					user    : userData,
					token   : token, 
					refreshToken: refreshToken
				});
			});
		}
	})(req, res);
}

/* GET REFRESH TOKEN */
module.exports.getRefreshToken = (req, res, next) => {
	let user = JSON.parse(req.body.user);
 	let refreshToken = req.body.refreshToken;

 	//console.log(user, refreshToken, refreshTokens, refreshTokens[refreshToken])

 	if((refreshToken in refreshTokens) && (refreshTokens[refreshToken] == user.email)) {
   	
	   	// user data
	   	const userData = {
	   		_id: user._id,
	   		user_type: "User",
	   		name: user.name,
	   		email: user.email
	   	}

	   	let refreshToken = jwt.sign(userData, process.env.jwt_secret, { expiresIn: 300 });

	   	return res.status(200).json({
	   		success : true,
	   		message : 'You successfully acquired a refresh token',
	   		refreshToken : refreshToken
	   	});
 	}

 	else {
   		return res.status(200).json({
   			success : false,
   			error: "Invalid Refresh Token"
   		});
 	}
}

module.exports.postRejectToken = (req, res, next) => {
	let refreshToken = req.body.refreshToken 
	
	if(refreshToken in refreshTokens) { 
	    delete refreshTokens[refreshToken]
	} 

	return res.send(204); 
}

/* Get user profile */
module.exports.getProfile = (req, res) => {
	return res.status(200).json({ 
		success: true, 
		error  : req.flash('error'),
		user   : req.user,
		message:'Successfully fetched profile'
	});
}

module.exports.getLogout = (req, res) => {
	req.logout();
	res.clearCookie('jwt');
	res.redirect('/api/user/signin')
};