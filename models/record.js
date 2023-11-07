const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const recordSchema = new Schema({
    // define whether this is a vital-check-only record
    // or its a standard record
    record_type: {type: String, required: true},

    smoking_status: {type : String, required: false},
    pregnancy_status: {type : String, required: false},
    chronic_condition: {type : String, required: false},
    current_medications: {type : String, required: false},
    allergies: {type : String, required: false},
    chief_complaint: {type : String, required: true},

    vitals: {        
        temperature: {type : Number, required: false},
        systolic_blood_pressure: {type : Number, required: false},
        diastolic_blood_pressure: {type : Number, required: false},
        pulse: {type : Number, required: false},
        oxygen: {type : Number, required: false},
        glucose: {type : Number, required: false},        
    },
    
    soap: {
        subjective: {type : String, required: false},
        objective: {type : String, required: false},
        assessment: {type : String, required: false},
    },

    provider_name: {type : String, required: false},
    scribe_name: {type : String, required: false},
    owner: {type : mongoose.Types.ObjectId, required: true, ref: 'Patient'}

}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);


//--------------JSON Sample:----------------------------------//
// {
//     "record": 
//      {
//         "record_type": "standard",
//         "smoking_status": "Yes",
//         "pregnancy_status": "No",
//         "chronic_condition": "diabetes",
//         "current_medications": "N.A.",
//         "allergies": "Sufa",
//         "chief_complaint": "Wound clean",
//         "vitals": {
//             "temperature": 97,
//             "blood_pressure": 99,
//             "pulse": 99,
//             "oxygen": 99,
//             "glucose": 99
//         },
//         "soap": {
//             "subjective": "...",
//             "objective": "...",
//             "assessment": "..."
//         },
//         "provider_name": "Dr. John",
//         "scribe_name": "Hazel",
//         "owner": "64fe7dccf072c23851e8567b",
//         "_id": "64fe875d4a817ea50b7fcf63",
//         "createdAt": "2023-09-11T03:19:57.866Z",
//         "updatedAt": "2023-09-11T03:19:57.866Z",
//         "__v": 0
//     }
// }
//------------------------------------------------------------//