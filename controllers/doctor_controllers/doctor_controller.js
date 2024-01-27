// const {validationResult} = require('express-validator');
const HttpError = require('../../models/http_error');
const Doctor = require('../../models/doctor');
const InvitationCode = require('../../models/invitationCode');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

// ---------------------- sign up a doctor user using phone number and invitation code -------------- //
const signup_phone = async (req, res, next) => {
    /* potentially can check whether the input of the signup proccess 
     *  is valid using validationResult from express-validator */

    const { name, title, phone_number, password, invitation_code } = req.body;

    try {
        // Query for non-expired invitation codes
        const nonExpiredCodes = await InvitationCode.find({ 
            expired: false,
            expiredTime: { $gt: new Date() } // the expired time must be greater than current time
        });        
        // Compare the invitation code from the request with each non-expired code and delete it after use
        let matchedCode = null;
        for (let code of nonExpiredCodes) {
            const result = await bcrypt.compare(invitation_code, code.code);
            if (result) {
                matchedCode = code;
                break;
            }
        }

        if (matchedCode) {
            await InvitationCode.deleteOne({ _id: matchedCode._id }); // Success, delete the code and continue
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
   
    let existingDoctor;
    try {
        existingDoctor = await Doctor.findOne({ phone_number: phone_number });
    } catch (err) {
        console.log('operation error: Doctor.findOne');
        const error = new HttpError(
            'Signing up failed, server error, please try again later', 500
        );
        return next(error);
    }

    if(existingDoctor) {
        const error = new HttpError(
            'A Doctor account with this phone number exists already, please login instead.', 400
        );
        
        return next(error);
    }

    let hashedPassword;
    try{
        hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
        console.log('operation error: bcrypt.hash');
        const error = new HttpError('Could not create doctor account, please try a gain later.', 500);
        return next(error);
    }
    

    const createdDoctor = new Doctor({
        name,
        title,
        email: "N/A: " + uuidv4(),
        phone_number,
        password: hashedPassword,
        profile_picture: "N/A",
        bio: "N/A",
        viewed_records: [],
        email_verify: false,
        phone_verify: false, 
    });

    try{
        await createdDoctor.save();
    } catch (err) {
        // check if the phone number already exists in the database
        if(err.errors && err.errors.phone_number && err.errors.phone_number.kind === 'unique'){
            return next( new HttpError('The phone number you entered already exists!', 400) );
        }
        // catch other server error
        console.log(err);
        return next(new HttpError(
            'Failed to sign up due to something wrong with server, please try again later', 500
        ));
    }

    const DoctorObject = createdDoctor.toObject( {getters: true} );
    // remove the sensitive info of Doctor in the response
    delete DoctorObject.password;

    let token;
    try {
        token = jwt.sign(
            { doctorId: DoctorObject.id },
            'server-secret',
            {expiresIn: '12h'}          
        );
    } catch (err) {
        console.log('operation error: jwt.sign');
        const error = new HttpError(
            'Signing up failed, please try again later.', 500
        );
        return next(error);
    }

    res.status(201).json( {
        message: 'Successfully Signed Up',
        token: token,
        doctor: DoctorObject
    } );
};

// ---------------------- log in and assign the doctor a Token ---------------------------------------- //
const login_phone = async (req, res, next) => {
    const { phone_number, password } = req.body;

    let existingDoctor;
    try{
        existingDoctor = await Doctor.findOne( {phone_number: phone_number} );
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Failed to login due to something wrong with server, please try again later', 500
        );
        return next(error);
    }

    if (!existingDoctor){
        const error = new HttpError(
            'The doctor user you tried to log in does not exist, please double check the phone number or you can try to sign up', 404
        );
        return next(error); 
    }

    let isValidPassword = false;
    try {
        isValidPassword = await bcrypt.compare(password, existingDoctor.password)
    } catch (err) {
        const error = new HttpError('Could not log you in, some error happens in our server', 500);
        return next(error);
    }

    if(!isValidPassword){
        const error = new HttpError(
            'The password you entered does not match the phone number, please try again', 401
        );
        return next(error);
    }

    // If success:
    let token;
    try {
        token = jwt.sign(
            { doctorId: existingDoctor.id },
            'server-secret',
            {expiresIn: '12h'}          
        );
    } catch (err) {
        const error = new HttpError(
            'Login failed, please try again later.', 500
        );
        return next(error);
    }

    const DoctorObject = existingDoctor.toObject( {getters: true} );
    delete DoctorObject.password;
    res.json( {
        message: 'Successfully logged in',
        token: token,
        doctor: DoctorObject
    } );

};

// ---------------------- get all the doctors --------------------------------------------------- //
const getDoctors = async (req, res, next) => {
    let doctors;
    try{
        doctors = await Doctor.find({}, '-password');
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'fetching Doctors faild', 500
        );
        return next(error);
    }
    res.json( { doctors: doctors.map(
        doctor => doctor.toObject( {getters: true} )
    ) } );
};

// -------------------------- add one record to a doctor's viewed_records ------------------------ //
const addToViewedRecords = async (req, res, next) => {
    
    const doctorId = req.params.doctor_id;
    const recordId = req.body.record_id;
    
    let doctor;
    try {
        doctor = await Doctor.findById(doctorId);        
    } catch (err) {
        console.log(err);
        return next(new HttpError('Finding doctor failed, please try again', 500));
    }

    if (!doctor) {
        console.log(doctorId)
        return next(
            new HttpError('Doctor dose not exists, please check doctor_id', 404)
        );
    }

    if (!doctor.viewed_records.includes(recordId)) {
        doctor.viewed_records.push(recordId);
    }

    try {
        await doctor.save();
    } catch (err) {
        console.log(err);
        return next(new HttpError('Updating doctor failed, please try again', 500));
    }

    res.status(200).json({ doctor: doctor.toObject({ getters: true }) });
};

// ------------ get all the viewed_records of the doctor given the doctor id ---------- //
const getViewedRecordsByDocId = async (req, res, next) => {
    const doctorId = req.params.doctor_id;

    let viewed_records;
    
    try {
        doc = await Doctor.findById({ _id: doctorId } ).populate('viewed_records');        
        viewed_records = doc.viewed_records;
    } catch (err) {
        console.log(err);
        return next(new HttpError(
            'Failed to find the viewed records due to something wrong with server, please try again later', 500
        ));        
    }

    if(!viewed_records || viewed_records.length === 0) {
        return next(
            new HttpError('Could not find any viewed records for the provided doctor id.', 404)
        );
    }

    res.json({ viewed_records: viewed_records.map(viewed_record => viewed_record.toObject({getters: true})) });
};



exports.signup_phone = signup_phone;
exports.login_phone = login_phone;
exports.getDoctors = getDoctors;
exports.addToViewedRecords = addToViewedRecords;
exports.getViewedRecordsByDocId = getViewedRecordsByDocId;