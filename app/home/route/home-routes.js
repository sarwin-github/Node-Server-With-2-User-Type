const express   = require('express');
const router    = express();

const homeController = require('../controller/home-controller');

router.route('/').get(homeController.getHome);

module.exports = router;
