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
            'Server Error: The server try to fetch Requests but faild', 500
        );
        return next(error);
    }
    res.json( {requests: requests.map(
        request => request.toObject( {getters:true} )
    )} );
};

const deleteOne = async (req, res, next) => {};

const updateRequest = async (req, res, next) => {
    const requestId = req.params.request_id;
    const updatedData = req.body;
    console.log(updatedData);

    let request
    try{
        request = await Request.findById(requestId);
        if (!request) {
            throw new Error('Request not found');
        }
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Server Error: The server try to fetch Requests but faild', 500
        );
        return next(error);
    }

    for (let key in updatedData) {
        request[key] = updatedData[key];
    }

    try {
        await request.save();
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Server Error: Failed to update the request', 500
        );
        return next(error);
    }

    res.status(200).json({request: request.toObject({ getters: true })});


};

exports.addByPatient = addByPatient;
exports.addByVolunteer = addByVolunteer;
exports.getAllRequests = getAllRequests;
exports.deleteOne = deleteOne;
exports.updateRequest = updateRequest;