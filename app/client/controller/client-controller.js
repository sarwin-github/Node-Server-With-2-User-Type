const jwt      = require('jsonwebtoken');
const passport = require("passport");
const Client   = require("../model/clients");
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

// Authenticate Client
module.exports.postLogin = (req, res, next) => {
	passport.authenticate('client-login', {session: false}, (err, client, info) => {
		if (err) { 
			return res.status(200).json({
				error : err,
				message : "Error logging in the client"
			});
		} 

		if (!client) {
			return res.status(200).json({
				error : info.message,
				message : "Error logging in the client"
			});
		} 

		if(!err && client){
			req.login(client, {session: false}, (err) => {
				if (err) {
					res.send(err);
				}

				// client data
				const clientData = {
					_id: client._id,
					user_type: "Client",
					name: client.name,
					email: client.email
				}

				const token = jwt.sign(clientData, process.env.jwt_secret, { expiresIn: 300 });
				
				// set refresh token
				const refreshToken = randtoken.uid(256);

				refreshTokens[refreshToken] = clientData.email;

				console.log(clientData, refreshTokens);

				return res.status(200).json({
					success : true,
					message : 'You successfully logged in your account',
					client  : clientData,
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

/* Create new client */
module.exports.signUp = (req, res) => {
	passport.authenticate('client-signup', {session: false}, (err, client, info) => {
		if (err) { 
			return res.status(200).json({
				error : err,
				message : "Error creating a new client"
			});
		} 

		console.log(info)

		if (!client) {
			return res.status(200).json({
				error : `Error creating a new client. ${ (info && info.length > 0 ? info.join(' ') : "Missing Credentials") }`,
				message : "Error creating a new client"
			});
		} 

		if(!err && client){
			req.login(client, {session: false}, (err) => {
				if (err) res.send(err);

				// client data
				const clientData = {
					_id: client._id,
					user_type: "Client",
					name: client.name,
					email: client.email
				}

				// set access token
				const token = jwt.sign(clientData, process.env.jwt_secret, { expiresIn: 300 });
				
				// set refresh token
				const refreshToken = randtoken.uid(256);
				refreshTokens[refreshToken] = clientData.email;

				return res.status(200).json({
					success : true,
					message : 'You successfully logged in your account',
					client  : clientData,
					token   : token, 
					refreshToken: refreshToken
				});
			});
		}

		/*res.status(200).json({
			success : true,
			message : 'You successfully created a new account',
			client  : {
				name   : client.name,
				email  : client.email,
				company: client.company,
				phone  : client.phone,
				address: client.address
			}
		});*/
	})(req, res);
}

/* GET REFRESH TOKEN */
module.exports.getRefreshToken = (req, res, next) => {
	let client = JSON.parse(req.body.client);
	let refreshToken = req.body.refreshToken;

 	//console.log(client, refreshToken, refreshTokens, refreshTokens[refreshToken])

 	if((refreshToken in refreshTokens) && (refreshTokens[refreshToken] == client.email)) {

	   	// client data
	   	const clientData = {
	   		_id: client._id,
	   		user_type: "Client",
	   		name: client.name,
	   		email: client.email
	   	}

	   	let refreshToken = jwt.sign(clientData, process.env.jwt_secret, { expiresIn: 300 });

	   	return res.status(200).json({
	   		success : true,
	   		message : 'You successfully acquired a refresh token',
	   		refreshToken   : refreshToken
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

/* Get client profile */
module.exports.getProfile = (req, res) => {
	return res.status(200).json({ 
		success: true, 
		error  : req.flash('error'),
		client : req.user,
		message:'Successfully fetched profile'
	});
}

module.exports.getLogout = (req, res) => {
	req.logout();
	res.clearCookie('jwt');
	res.redirect('/api/client/signin')
};