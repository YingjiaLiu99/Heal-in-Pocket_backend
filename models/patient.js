const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const patientSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    phone_number: {type: Number, required: true},
    date_of_birth: {type: String, required: true},
    gender: {type: String, required: true},
    password: {type: String, required: true, minlength: 8},
    insurance: {type: String, required: true},
    profile_picture: {type: String, required: true},
    records: [ {type: mongoose.Types.ObjectId, required: true, ref: 'Record'} ]
});

patientSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Patient', patientSchema);