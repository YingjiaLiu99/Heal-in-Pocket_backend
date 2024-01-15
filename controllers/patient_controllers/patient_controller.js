// const {validationResult} = require('express-validator');
const HttpError = require('../../models/http_error');
const Patient = require('../../models/patient');
const { v4: uuidv4 } = require('uuid');

// ------------------------ patient sign up ---------------------------------- //
const signup = async (req, res, next) => {
    /* potentially can check whether the input of the signup proccess 
     *  is valid using validationResult from express-validator */

    const { name, email, phone_number, date_of_birth, gender, password,
     insurance, primary_care_provider, last_seen, profile_picture } = req.body;

    const createdPatient = new Patient({
        name,
        email,
        phone_number,
        date_of_birth,
        gender,
        password,
        insurance,
        primary_care_provider,
        last_seen,
        profile_picture,
        records: [],
        email_verify: true,
        phone_verify: true
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
    res.status(201).json({ patient: PatientObject });
};


// ------------- login using email for now, can be improved later ------------ //
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


// ------------- get single patient object using its id ---------------------- //
const getPatientByPatientId = async (req, res, next) => {
    const patientId = req.params.patient_id;
    let patient;
    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err);
        return next(new HttpError(
            'Failed to get the patient using its id due to something wrong with server, please try again later', 500
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

// ------------- update a patient's information ----------------------------- //
const updatePatientInformation = async (req, res, next) => {
    const patientId = req.params.patient_id;
    const {insurance, primary_care_provider, last_seen} = req.body
    let patient;

    try {
        patient = await Patient.findById(patientId);
    } catch (err) {
        console.log(err);
        return next(new HttpError(
            'Failed to get the patient using its id due to something wrong with server, please try again later', 500
        ));        
    }

    if (!patient) {
        return next(new HttpError(
            'Could not find the patient that you tried to update', 404
        ));
    }

    // Only change the fields that need to change
    if ((insurance !== undefined) && (patient.insurance !== insurance)) {
        patient.insurance = insurance;
        if (insurance === "") {
            patient.insurance = "N/A";
        }
    }
    if ((primary_care_provider !== undefined) && (patient.primary_care_provider !== primary_care_provider)) {
        patient.primary_care_provider = primary_care_provider;
        if (primary_care_provider === "") {
            patient.primary_care_provider = "N/A";
        }
    }
    if ((last_seen !== undefined) && (patient.last_seen !== last_seen)) {
        patient.last_seen = last_seen;
        if (last_seen === "") {
            patient.last_seen = "N/A";
        }
    }

    try {
        await patient.save();
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Server Error: Failed to update the patient information', 500
        );
        return next(error);
    }

    const PatientObject = patient.toObject( {getters: true} );
    // remove the sensitive info of Patient in the response
    delete PatientObject.password;
    res.status(201).json( {patient: PatientObject} );   
};


// ------------- for volunteer to register a new patient --------------------- //
const volCreateNewPatientWithoutPhoneNum = async (req, res, next) => {
    
    const { name, date_of_birth, gender, insurance, primary_care_provider, last_seen } = req.body;

    const createdPatient = new Patient({
        name,
        email: "N/A: " + uuidv4(),
        phone_number: -1,
        date_of_birth,
        gender,
        password: "----N/A----",
        insurance,
        primary_care_provider,
        last_seen,
        profile_picture: "N/A",
        records: [],
        email_verify: false,
        phone_verify: false
    });

    try{
        await createdPatient.save();
    } catch (err) {
        // catch other server error
        console.log(err);
        return next(new HttpError(
            'Failed to create patient without phone number due to something wrong with server, please try again later', 500
        ));
    }

    const PatientObject = createdPatient.toObject( {getters: true} );
    // remove the sensitive info of Patient in the response
    delete PatientObject.password;
    res.status(201).json( {patient: PatientObject} );
};


// ---------------------- query patients by name  ---------------------------- //
const queryPatientsByName = async (req, res, next) => {
    const patientName = req.params.name;
    let queryResult;
    try {
        // Construct the search query using MongoDB Atlas Search
        const searchAggregation = [
        // search stage
        {
            $search: {
                index: 'searchPatients',
                autocomplete: {
                    query: patientName,
                    path: 'name',           // the is the field to search in
                    // fuzzy: {                // use for handling minor typos
                    //     maxEdits: 1,        // Maximum number of single-character edits required to match the specified search term
                    //     prefixLength: 3     // Number of characters at the beginning of each term in the result that must exactly match.
                    // }
                }
            }
                       
        },
        // Add a project stage to exclude the password field
        {
            $project: {
                password: 0, // Exclude the password field
                // Include any other fields you want to exclude or include
            }
        }
        ];        
        queryResult = await Patient.aggregate(searchAggregation); // Execute the query using Mongoose
    } catch (err) {
        console.log(err);
        return next(new HttpError(
            'Failed to query the patients due to something wrong with server, please try again later', 500
        ));
    }
    // Map over the query result to convert '_id'(ObjectId) to 'id'(String)
    const patients = queryResult.map(patient => {
        // Create a new object for each patient
        return {
            ...patient,
            id: patient._id.toString(), // Convert '_id' to a string and assign to 'id'           
        };
    });

    res.json({ patients: patients });
};


exports.signup = signup;
exports.login = login;
exports.getPatientByPatientId = getPatientByPatientId;
exports.volCreateNewPatientWithoutPhoneNum = volCreateNewPatientWithoutPhoneNum;
exports.queryPatientsByName = queryPatientsByName;
exports.updatePatientInformation = updatePatientInformation;