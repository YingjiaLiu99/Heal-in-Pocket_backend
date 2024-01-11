const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const volunteerSchema = new Schema({
    name: {
        type: String, 
        required: true,
    },
    phone_number: {
        type: String,
        required: [true, "Please provide an Phone Number!"],
        unique: [true, "Phone Number Exist"],
    },
    password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
    },
});

volunteerSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Volunteer', volunteerSchema);