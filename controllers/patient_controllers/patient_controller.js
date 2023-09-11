// const {validationResult} = require('express-validator');
const HttpError = require('../../models/http_error');
const Patient = require('../../models/patient');


const signup = async (req, res, next) => {
    /* potentially can check whether the input of the signup proccess 
     *  is valid using validationResult from express-validator */

    const { name, email, phone_number, date_of_birth, gender, password, insurance, profile_picture } = req.body;

    const createdPatient = new Patient({
        name,
        email,
        phone_number,
        date_of_birth,
        gender,
        password,
        insurance,
        profile_picture,
        records: []
    });

    try{
        await createdPatient.save();
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

    const PatientObject = createdPatient.toObject( {getters: true} );
    // remove the sensitive info of Patient in the response
    delete PatientObject.password;
    res.status(201).json( {patient: PatientObject} );
};


// login using email for now, can be improved later
const login = async (req, res, next) => {
    const { email, password } = req.body;

    let existingPatient;
    try{
        existingPatient = await Patient.findOne( {email: email} );
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Failed to login due to something wrong with server, please try again later', 500
        );
        return next(error);
    }

    if (!existingPatient) {
        const error = new HttpError(
            'The patient user you tried to log in does not exist, please try a different email address', 401
        );
        return next(error);
    }

    if (existingPatient.password !== password){
        const error = new HttpError(
            'The password you entered does not match the email address, please try again', 401
        );
        return next(error);
    }

    // If success (DUMMY login)
    res.json( {message: 'Logged in'} );

};

const getPatientByPatientId = async (req, res, next) => {
    const patientId = req.params.patient_id;
    let patient;
    try{
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err);
        return next(new HttpError(
            'Failed to sign up due to something wrong with server, please try again later', 500
        ));        
    }

    if (!patient) {
        return next(new HttpError(
            'Could not find the patient corresponding to the provided patient id', 404
        ));        
    }

    const PatientObject = patient.toObject( {getters: true} );
    // remove the sensitive info of Patient in the response
    delete PatientObject.password;
    res.status(201).json( {patient: PatientObject} );    
};


exports.signup = signup;
exports.login = login;
exports.getPatientByPatientId = getPatientByPatientId;