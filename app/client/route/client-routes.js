const express   = require('express');
const router    = express();

const clientController = require('../controller/client-controller');
const clientMiddleware = require('../middleware/client-middleware');

/* get login form */
router.route('/signin').get(clientController.getLogin);
router.route('/signin').post(clientController.postLogin);

router.route('/signup').get(clientController.getSignupForm);
router.route('/signup').post(clientController.signUp);

router.route('/token/refresh').post(clientController.getRefreshToken);
router.route('/token/reject').delete(clientController.postRejectToken);

/* get profile */
router.route('/profile').get(clientMiddleware.authorizeAccess, clientController.getProfile);
router.route('/logout').get(clientController.getLogout);

module.exports = router;
