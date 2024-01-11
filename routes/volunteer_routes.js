const express = require('express');
const volunteerControllers = require('../controllers/volunteer_controllers/volunteer_controller');
const router = express.Router();

// volunteer sign up
router.post('/signup', volunteerControllers.signup);


// volunteer log in
router.post('/login', volunteerControllers.login);


module.exports = router;