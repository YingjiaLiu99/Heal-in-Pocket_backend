const HttpError = require('../../models/http_error');
const Request = require('../../models/request');

const addByPatient = async (req, res, next) => {};

const addByVolunteer = async (req, res, next) => {};

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

const deleteOne = async (req, res, next) => {
    // Get the request id from route
    const requestId = req.params.request_id;
    let requestDocument;

    // Delete the request
    try {
        // await requests.delete();
        // Call mongoose API, findByIdAndDelete has return 
        requestDocument = await Request.findByIdAndDelete(requestId);
    } catch (err) {
        console.log(err);
        return next(new HttpError(
            'Failed to delete the request due to something wrong with the server, please try again later', 500
        )); 
    }

    // Check if the request was actually found
    if (!requestDocument) {
        return next(new HttpError(
            'Could not find the request corresponding to the provided request id', 404
        ));
    }

    res.json( {message: "Request delete success"});
};

exports.addByPatient = addByPatient;
exports.addByVolunteer = addByVolunteer;
exports.getAllRequests = getAllRequests;
exports.deleteOne = deleteOne;