const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const requestSchema = new Schema({
    patient_name: {type: String, required: true},
    corresponding_record: {type: mongoose.Types.ObjectId, required: true, ref: 'Record'},
    new_patient: {type: Boolean, required: true},
    chief_complaint: {type: String, required: true},
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);