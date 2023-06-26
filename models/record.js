const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const recordSchema = new Schema({
    smoking_status: {type : String, required: true},
    pregnancy_status: {type : String, required: true},  
    chronic_condition: {type : String, required: true},
    current_medications: {type : String, required: true},
    allergies: {type : String, required: true},      
    
    vitals: {
        pain_level: {type : Number, required: true},
        temperature: {type : Number, required: true},
        blood_pressure: {type : Number, required: true},
        pulse: {type : Number, required: true},
        oxygen: {type : Number, required: true},
        glucose: {type : Number, required: true},
        height: {type : Number, required: true},
        weight: {type : Number, required: true}
    },
        
    owner: {type : mongoose.Types.ObjectId, required: true, ref: 'Patient'}
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);