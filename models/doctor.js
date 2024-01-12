const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const doctorSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    phone_number: {type: Number, required: true, unique: true},
    password: {type: String, required: true, minlength: 8},
    profile_picture: {type: String, required: true},
    viewed_records: [ {type: mongoose.Types.ObjectId, required: true, ref: 'Record'} ],    
    email_verify: {type: Boolean, required: true},
    phone_verify: {type: Boolean, required: true} 
});

doctorSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Doctor', doctorSchema);