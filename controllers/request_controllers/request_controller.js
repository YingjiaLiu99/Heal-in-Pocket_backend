const HttpError = require('../../models/http_error');
const Request = require('../../models/request');

const addByPatient = async (req, res, next) => {};

const addByVolunteer = async (req, res, next) => {
    const { patient_name, corresponding_record, new_patient, chief_complaint } = req.body;

    const newRequest = new Request({
        patient_name,
        corresponding_record,
        new_patient,
        chief_complaint
    });
    // console.log(newRequest)

    try {
        await newRequest.save();
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'new request failed due to mongoDB save() function failed', 500
        );
        return next(error);
    }

    res.status(201).json({ request: newRequest.toObject({ getters: true }) });
};

const getAllRequests = async (req, res, next) => {
    let requests;
    try{
        requests = await Request.find();
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'fetching Request faild', 500
        );
        return next(error);
    }
    res.json( {requests: requests.map(
        request => request.toObject( {getters:true} )
    )} );
};

const deleteOne = async (req, res, next) => {};

exports.addByPatient = addByPatient;
exports.addByVolunteer = addByVolunteer;
exports.getAllRequests = getAllRequests;
exports.deleteOne = deleteOne;