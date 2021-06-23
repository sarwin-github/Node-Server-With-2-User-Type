const express   = require('express');
const router    = express();

const userController = require('../controller/user-controller');
const userMiddleware = require('../middleware/user-middleware');

/* get login form */
router.route('/signin').get(userController.getLogin);
router.route('/signin').post(userController.postLogin);

router.route('/signup').get(userController.getSignupForm);
router.route('/signup').post(userController.signUp);

router.route('/token/refresh').post(userController.getRefreshToken);
router.route('/token/reject').delete(userController.postRejectToken);

/* get profile */
router.route('/profile').get(userMiddleware.authorizeAccess, userController.getProfile);
router.route('/logout').get(userController.getLogout);

module.exports = router;
