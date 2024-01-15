const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const invitationCodeSchema = new Schema({
    code: {type: String, required: true},
    createdTime: {type: Date, required: true},
    expiredTime: {type: Date, required: true},
    expired: {type: Boolean, required: true},    
}, { timestamps: true });

module.exports = mongoose.model('InvitationCode', invitationCodeSchema);