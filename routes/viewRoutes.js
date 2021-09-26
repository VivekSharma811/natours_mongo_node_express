const express = require('express');
const viewsController = require('../controllers/viewsController');
const authControlloer = require('./../controllers/authController');

const router = express.Router();

router.use(authControlloer.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tour/:slug', viewsController.getTour);
router.get('/login', viewsController.getLoginForm);

module.exports = router;