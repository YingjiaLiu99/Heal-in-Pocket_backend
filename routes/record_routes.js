const express = require('express');

const recordControllers = require('../controllers/record_controllers/record_controller');

const router = express.Router();


// upload a new record
router.post('/', recordControllers.createRecord);

// get all the records by the patient's id
router.get('/patient/:patient_id', recordControllers.getRecordsByPatientId);

// get the record by the record's id
router.get('/:record_id', recordControllers.getRecordByRecordId);

// update the record
router.put('/:record_id', recordControllers.updateRecord);

module.exports = router;


