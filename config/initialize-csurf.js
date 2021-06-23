const csurf = require('csurf');

module.exports.initializeCSURF = (app) => {
	app.use(csurf());

	app.use(function(req, res, next) {
		res.cookie('XSRF-TOKEN', req.csrfToken());
	  	res.locals._csrf = req.csrfToken();
	 	next();
	}); 
}