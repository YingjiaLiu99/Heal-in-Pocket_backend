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
            'Server Error: The server try to fetch Requests but faild', 500
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