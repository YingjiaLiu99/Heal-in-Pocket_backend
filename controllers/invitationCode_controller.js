const HttpError = require('../models/http_error');
const InvitationCode = require('../models/invitationCode');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');


const create_new_code = async (req, res, next) => {

    let plainCode;
    let hashedCode;
    try {
        const currentTime = new Date();
        const expiredTime = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000); // 24 hours later        
        plainCode = uuidv4();
        hashedCode = await bcrypt.hash(plainCode, 12);        
        const newCode = new InvitationCode({
            code: hashedCode,
            createdTime: currentTime,
            expiredTime: expiredTime,
            expired: false
        });

        await newCode.save();
        res.status(201).json({ invitationCode: newCode, plainCode: plainCode });
    } catch (err) {
        const error = new HttpError('failed to create new invitation code, please try again later', 500);
        return next(error);
    }    
}

const delete_code = async (req, res, next) => {    
    const codeId = req.params.id;
    let invitationCode;
    try {
        invitationCode = await InvitationCode.findById(codeId);
    } catch (err) {
        const error = new HttpError(
            'Server Error: The server try to fetch invitationCode but faild', 500
        );
        return next(error);
    }

    // check if the invitation code is found
    if (!invitationCode) {
        return next(new HttpError(
            'Could not find the invitationCode corresponding to the provided id', 404
        ));
    }

    try {
        invitationCode.deleteOne();
    } catch (err) {
        const error = new HttpError(
            'Server Error: Failed to delete the invitationCode', 500
        );
        return next(error);
    }
    res.json( {message: "Invitation Code deleted successfully"} );
}


exports.create_new_code = create_new_code;
exports.delete_code = delete_code;