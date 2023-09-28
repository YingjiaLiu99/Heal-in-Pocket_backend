const express = require('express');

const requestControllers = require('../controllers/request_controllers/request_controller');

const router = express.Router();

// patient add a request
router.post('/patient/add', requestControllers.addByPatient);

// volunteer add a request
router.post('/volunteer/add', requestControllers.addByVolunteer);

// get all the request
router.get('/', requestControllers.getAllRequests);

// delete a request
router.delete('/:request_id', requestControllers.deleteOne);


module.exports = router;