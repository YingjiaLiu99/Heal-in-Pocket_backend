// const {validationResult} = require('express-validator');
const HttpError = require('../../models/http_error');
const Doctor = require('../../models/doctor');

const signup = async (req, res, next) => {
    /* potentially can check whether the input of the signup proccess 
     *  is valid using validationResult from express-validator */

    const {name, email, phone_number, password, profile_picture} = req.body;

    const createdDoctor = new Doctor({
        name,
        email,
        phone_number,
        password,
        profile_picture,
        viewed_records: [],
        online_status: 'online'
    });

    try{
        await createdDoctor.save();
    } catch (err) {
        // check if the email already exists in the database
        if(err.errors && err.errors.email && err.errors.email.kind === 'unique'){
            return next(new HttpError('The email you entered already exists!', 400));
        }
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
    res.status(201).json( {doctor: DoctorObject} );
};

// login using email for now, can be improved later
const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingDoctor;
    try{
        existingDoctor = await Doctor.findOne( {email: email} );
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Failed to login due to something wrong with server, please try again later', 500
        );
        return next(error);
    }

    if (!existingDoctor){
        const error = new HttpError(
            'The doctor user you tried to log in does not exist, please try a different email address', 401
        );
        return next(error); 
    }

    if (existingDoctor.password !== password){
        const error = new HttpError(
            'The password you entered does not match the email address, please try again', 401
        );
        return next(error);
    }

    // If success (DUMMY login)
    res.json( {message: 'Logged in'} );

};

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



exports.signup = signup;
exports.login = login;
exports.getDoctors = getDoctors;
exports.addToViewedRecords = addToViewedRecords;
exports.getViewedRecordsByDocId = getViewedRecordsByDocId;