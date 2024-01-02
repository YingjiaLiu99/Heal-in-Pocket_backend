const express = require('express');

const doctorControllers = require('../controllers/doctor_controllers/doctor_controller');

const router = express.Router();

// doctor sign up
router.post('/signup', doctorControllers.signup);

// doctor log in
router.post('/login', doctorControllers.login);

// get all the doctors
router.get('/', doctorControllers.getDoctors);

// add to viewed_records
router.patch('/:doctor_id/addViewedRecords', doctorControllers.addToViewedRecords);


module.exports = router;