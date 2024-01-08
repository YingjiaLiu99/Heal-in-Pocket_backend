const express = require('express');

const patientControllers = require('../controllers/patient_controllers/patient_controller');

const router = express.Router();

// patient sign up
router.post('/signup', patientControllers.signup);

// patient log in
router.post('/login', patientControllers.login);

// get the patient by the patient's id
router.get('/patient/:patient_id', patientControllers.getPatientByPatientId);

// volunteer create new patient 
router.post('/volCreateNewPatientWithoutPhoneNum', patientControllers.volCreateNewPatientWithoutPhoneNum);

// query patients by name(or partial name)
router.get('/search/:name', patientControllers.queryPatientsByName);

// update a patient's information
router.patch('/update/:patient_id', patientControllers.updatePatientInformation);

module.exports = router;