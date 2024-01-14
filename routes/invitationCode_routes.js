const express = require('express');

const invitationCodeControllers = require('../controllers/invitationCode_controller');

const router = express.Router();

// create a new invitation code
router.post('/newCode', invitationCodeControllers.create_new_code);

// delete a used invitation code
router.delete('/:id', invitationCodeControllers.delete_code);


module.exports = router;