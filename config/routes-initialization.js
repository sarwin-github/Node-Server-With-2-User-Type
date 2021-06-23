//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Get Routes Source
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const HomeRoutes = require('../app/home/route/home-routes');
const UserRoutes = require('../app/user/route/user-routes');
const ClientRoutes = require('../app/client/route/client-routes');

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// Set and Initialize Routes
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
module.exports.initializeRoutes = app => {
	/* Home routes */
	app.use('/api', HomeRoutes);

	/* User routes */
	app.use('/api/user', UserRoutes);

	/* Client routes */
	app.use('/api/client', ClientRoutes);
};
