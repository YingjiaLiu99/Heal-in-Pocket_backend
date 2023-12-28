const express = require('express');

const patientControllers = require('../controllers/patient_controllers/patient_controller');

const router = express.Router();

// patient sign up
router.post('/signup', patientControllers.signup);

// patient log in
router.post('/login', patientControllers.login);

// get the patient by the patient's id
router.get('/:patient_id', patientControllers.getPatientByPatientId);

// volunteer create new patient 
router.post('/volCreateNewPatientWithoutPhoneNum', patientControllers.volCreateNewPatientWithoutPhoneNum);


module.exports = router;