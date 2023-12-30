const HttpError = require('../../models/http_error');
const Request = require('../../models/request');

const addByPatient = async (req, res, next) => {};

// ----------- volunteer creates a new request ----------------- //
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


// ----------- get all the requests in the queue -------------- //
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
        request => request.toObject( { getters:true } )
    )} );
};


// ----------- get single request given its id ------------------ //
const getRequestById = async (req, res, next) => {
    const requestId = req.params.request_id;
    let request;
    try {
        request = await Request.findById(requestId);
    } catch (err) {
        console.log(err);
        return next(new HttpError(
            'Failed to find the request by its id due to something wrong with server, please try again later', 500
        ));
    }

    if (!request) {
        return next(new HttpError(
            'Could not find the request corresponding to the provided request id', 404
        ));
    }

    const RequestObject = request.toObject( {getters: true} );
    res.status(201).json( {request: RequestObject} );
};


// ----------- delete a request given its id ------------------ //
const deleteRequestById = async (req, res, next) => {
    // Get the request id from route
    const requestId = req.params.request_id;
    let request;
    // Delete the request
    try {        
        request = await Request.findById(requestId);
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Server Error: The server try to fetch Requests but faild', 500
        );
        return next(error); 
    }

    // Check if the request was actually found
    if (!request) {
        return next(new HttpError(
            'Could not find the request corresponding to the provided request id', 404
        ));
    }

    try {
        request.deleteOne();
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Server Error: Failed to delete the request', 500
        );
        return next(error);
    }    

    res.json( {message: "Request delete success."} );
};


// ----------- update a request given its id ------------------ //
const updateRequest = async (req, res, next) => {
    const requestId = req.params.request_id;
    const updatedData = req.body;
    console.log(updatedData);

    let request;
    try{
        request = await Request.findById(requestId);        
    } catch (err) {
        console.log(err);
        const error = new HttpError(
            'Server Error: The server try to fetch Requests but faild', 500
        );
        return next(error);
    }

    if (!request) {
        return next(new HttpError(
            'Could not find the request that you tried to update', 404
        ));
    }

    for (let field in updatedData) {
        request[field] = updatedData[field];
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
exports.getRequestById = getRequestById;
exports.deleteRequestById = deleteRequestById;
exports.updateRequest = updateRequest;