module.exports.initializeVariable = (req, res, next) => {
  	res.locals.session = req.session;
  	res.locals.title   = "Angular Boiler Plate";
	res.locals.node_environment   = process.env.NODE_EN;

	next();
};