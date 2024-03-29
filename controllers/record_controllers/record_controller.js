const mongoose = require('mongoose');

const HttpError = require('../../models/http_error');
const Record = require('../../models/record');
const Patient = require('../../models/patient');

// -------------------------- create a new record -------------------------------- //
const createRecord = async (req, res, next) => {
    const { record_type, smoking_status, pregnancy_status, chronic_condition, current_medications, allergies, chief_complaint, vitals, soap, provider_name, scribe_name, owner } = req.body;

    const createdRecord = new Record({
        record_type,
        smoking_status,
        pregnancy_status,
        chronic_condition,
        current_medications,
        allergies,
        chief_complaint,
        vitals,
        soap,
        provider_name,
        scribe_name,
        owner
    });

    let patient;
    try {
        patient = await Patient.findById(owner);
    } catch (err) {
        console.log(err);
        return next(new HttpError(
            'Failed to create record due to something wrong with server, please try again later', 500
        ));
    }

    // the record's owner(patient) doesn't exist in the database
    if(!patient){
        return next(new HttpError(
            'Failed to create record because the corresponding patient doesnt exist', 404
        ));
    }


    const sess = await mongoose.startSession();
    sess.startTransaction();
    try{    
        await createdRecord.save( {sessoin: sess} );
        patient.records.push(createdRecord);
        await patient.save( {session: sess} );

        await sess.commitTransaction();

    } catch (err) {
        console.log(err);
        await sess.abortTransaction();
        const error = new HttpError('creating record failed due to server error', 500);
        return next(error);
    } finally {
        sess.endSession();
    }

    res.status(201).json( {record: createdRecord} );
};


// ------------------ get a single record given its id --------------------------- //
const getRecordByRecordId = async (req, res, next) => {
    const recordId = req.params.record_id;
    let record;
    try{
        record = await Record.findById(recordId);
    } catch (err) {
        console.log(err);
        return next(new HttpError(
            'Failed to find the record due to something wrong with server, please try again later', 500
        ));
    }

    if(!record){        
        return next(new HttpError(
            'Could not find the record corresponding to the provided record id', 404
        ));
    }

    res.json({ record: record.toObject({getters: true}) });
};


// ------------ get all the records of one patient given the patient id ---------- //
const getRecordsByPatientId = async (req, res, next) => {
    const patientId = req.params.patient_id;
    let records;
    
    try {
        records = await Record.find( { owner: patientId } );
    } catch (err) {
        console.log(err);
        return next(new HttpError(
            'Failed to find the record due to something wrong with server, please try again later', 500
        ));        
    }

    if(!records || records.length === 0) {
        return next(
            new HttpError('Could not find any record for the provided patient id.', 404)
        );
    }

    res.json({ records: records.map(record => record.toObject({getters: true})) });
};


// ------------------------ update a record given its id ------------------------- //
const updateRecord = async (req, res, next) => {
    const record_id = req.params.record_id;
    const updatedData = req.body;
    console.log(updatedData);

    let record;
    try {
        record = await Record.findById(record_id);
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Server Error: The server try to fetch Record but faild', 500
        );
        return next(error);
    }

    if (!record) {
        return next(new HttpError(
            'Could not find the record that you tried to update', 404
        ));
    }

    for (let field in updatedData) {
        record[field] = updatedData[field];
    }

    try {
        await record.save();
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Server Error: Failed to update the record', 500
        );
        return next(error);
    }

    res.status(200).json({record: record.toObject({ getters: true })});
};


exports.createRecord = createRecord;
exports.getRecordByRecordId = getRecordByRecordId;
exports.getRecordsByPatientId = getRecordsByPatientId;
exports.updateRecord = updateRecord;