const express = require('express');

const doctorControllers = require('../controllers/doctor_controllers/doctor_controller');

const router = express.Router();

// doctor sign up
router.post('/signup', doctorControllers.signup);

// doctor log in
router.post('/login', doctorControllers.login);

// get all the doctors
router.get('/all', doctorControllers.getDoctors);

// add a record to doctor's viewed_records
router.patch('/addViewedRecords/:doctor_id', doctorControllers.addToViewedRecords);


module.exports = router;