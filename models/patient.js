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
    primary_care_provider: {type: String, required: true},
    last_seen: {type: String, required: true},
    profile_picture: {type: String, required: true},
    records: [ {type: mongoose.Types.ObjectId, required: true, ref: 'Record'} ],
    email_verify: {type: Boolean, required: true},
    phone_verify: {type: Boolean, required: true}
}, { timestamps: true });

patientSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Patient', patientSchema);

// -----------------Sample JSON data: ------------------------//
// {
//     "name":"David Liu",
//     "email":"test@gmail.com",
//     "phone_number":8583614927,
//     "date_of_birth":"11/06/1999",
//     "gender":"male",
//     "password":"1234567890",
//     "insurance":"N/A",
//     "primary_care_provider": "N/A",
//     "last_seen": "street corner care",
//     "profile_picture":"N.A.",
//     "records":[],
//     "email_verify": false,
//     "phone_verify": false
// }
// ----------------------------------------------------------//