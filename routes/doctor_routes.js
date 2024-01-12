const express = require('express');

const doctorControllers = require('../controllers/doctor_controllers/doctor_controller');

const router = express.Router();

// doctor sign up
router.post('/signup-phone', doctorControllers.signup_phone);

// doctor log in
router.post('/login-phone', doctorControllers.login_phone);

// get all the doctors
router.get('/all', doctorControllers.getDoctors);

// add a record to doctor's viewed_records
router.patch('/addViewedRecords/:doctor_id', doctorControllers.addToViewedRecords);

// get all the viewed_records by the doctor's id
router.get('/viewedRecords/:doctor_id', doctorControllers.getViewedRecordsByDocId);


module.exports = router;