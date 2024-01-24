const HttpError = require('../../models/http_error');
const Volunteer = require('../../models/volunteers');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const InvitationCode = require('../../models/invitationCode');

const signup_phone = async (req, res, next) => {
   
    const {phone_number, password, name, invitation_code} = req.body;

    let matchedCode = null;
    try {
        // Query for non-expired invitation codes
        const nonExpiredCodes = await InvitationCode.find({ 
            expired: false,
            expiredTime: { $gt: new Date() } // the expired time must be greater than current time
        });        
        // Compare the invitation code from the request with each non-expired code and delete it after use
       
        for (let code of nonExpiredCodes) {
            const result = await bcrypt.compare(invitation_code, code.code);
            if (result) {
                matchedCode = code;
                break;
            }
        }
        
        if(!matchedCode) {
            const error = new HttpError(
                'Invalid Invitation Code', 404
            );
            return next(error);
        }

    } catch (err) {
        // other operation/server error
        console.log('operation error: InvitationCode.find or bcrypt.compare or InvitationCode.deleteOne');
        const error = new HttpError(
            'Signing up failed, server error, please try again later', 500
        );
        return next(error);
    }

    let existedVolunteer;
    try {
        existedVolunteer = await Volunteer.findOne({ phone_number: req.body.phone_number });
    } catch (err) {
        console.log('operation error: Volunteer.findOne');
        const error = new HttpError(
            'Signing up failed, server error, please try again later', 500
        );
        return next(error);
    }

    if (existedVolunteer) {
        return next( new HttpError('The phone number you entered already exists!', 400) );
    }

    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        console.log('operation error: bcrypt.hash');
        return next(new HttpError(
            'Password was not hashed successfully, or password is not provided',
            500
        ));
    }

    const createdVolunteer = new Volunteer({
        name: name,
        phone_number: phone_number,
        password: hashedPassword,
    });

    try {
        await createdVolunteer.save();
    } catch (err) {                    
        // check if the phone number already exists in the database
        if(err.errors && err.errors.phone_number && err.errors.phone_number.kind === 'unique'){
            return next( new HttpError('The phone number you entered already exists!', 400) );
        }
    
        console.log(err);
        return next(new HttpError(
            'Signing up failed, error creating volunteer, please try again later.',
            500
        ));
    }

    if (matchedCode) {
        try {
            await InvitationCode.deleteOne({ _id: matchedCode._id }); // Success, delete the code and continue
        } catch (err) {
            console.log('operation error: InvitationCode.deleteOne');
            const error = new HttpError(
                'Signing up failed, server error, please try again later', 500
            );
            return next(error);
        }
    }

    const volunteerObject = createdVolunteer.toObject({ getters: true });
    delete volunteerObject.password;

    let token;
    try {
        token = jwt.sign(
            {
                volunteerId: volunteerObject.id,
                volunteerPhoneNumber: volunteerObject.phone_number,
            },
            "RANDOM-TOKEN",
            { expiresIn: "12h" }
        );
    } catch (err) {
        console.log('operation error: jwt.sign');
        const error = new HttpError(
            'Signing up failed, please try again later.', 500
        );
        return next(error);
    }

    res.status(201).json({ 
        message: "Successfully Registered", 
        volunteer: volunteerObject,
        token: token,

    });

};

// password compare has issue: 
const login_phone = async (req, res, next) => {


    const {phone_number, password} = req.body;

    let existedVolunteer;
    try {
        existedVolunteer = await Volunteer.findOne({ phone_number: phone_number });
    } catch (err) {
        console.log('operation error: Volunteer.findOne');
        const error = new HttpError(
            'Signing up failed, server error, please try again later', 500
        );
        return next(error);
    }

    if (!existedVolunteer) {
        return next( new HttpError('The volunteer user you trying to login does not exist! Please double check the phone number', 404) );
    }

    let passwordCheck = false;
    try{
        passwordCheck = await bcrypt.compare(password, existedVolunteer.password);
    } catch (err) {
        console.log('operation error: bcrypt.compare');
        return next(new HttpError(
            'Could not log you in, some error happens in our server',
            500
        ));
    }

    if (!passwordCheck) {
        return next(new HttpError(
            'The password you entered does not match the phone number, please try again',
            401
        ));
    }

    // If login success, create JWT token
    let token;
    try {
        token = jwt.sign(
            {volunteerId: existedVolunteer.id, volunteerPhoneNumber: existedVolunteer.phone_number}, 
            "RANDOM-TOKEN",
            { expiresIn: "12h" }
        );
    }
    catch (err) {
        console.log('operation error: jwt.sign');
        const error = new HttpError(
            'Login failed, please try again later.', 500
        );
        return next(error);
    }

    const volunteerObject = existedVolunteer.toObject({ getters: true });
    delete volunteerObject.password;
    res.json({
        message: "Login Successful",
        volunteer: volunteerObject,
        token: token,
    });

};

exports.signup_phone = signup_phone;
exports.login_phone = login_phone;