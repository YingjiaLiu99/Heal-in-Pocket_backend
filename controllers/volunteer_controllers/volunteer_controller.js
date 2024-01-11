const HttpError = require('../../models/http_error');
const Volunteer = require('../../models/volunteers');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const signup = async (req, res, next) => {
    // hash the password
    bcrypt
        .hash(req.body.password, 10)
        .then(hashedPassword => {
            const createdVolunteer = new Volunteer({
                name: req.body.name,
                phone_number: req.body.phone_number,
                password: hashedPassword,
            });
            createdVolunteer
                .save()
                .then(result => {
                    res.status(201).json({ 
                        message: "Successfully Registered", 
                        volunteer: result.toObject({ getters: true })
                    });
                })
                .catch(err => {
                    console.log(err);
                    
                    // check if the phone number already exists in the database
                    if(err.errors && err.errors.phone_number && err.errors.phone_number.kind === 'unique'){
                        return next( new HttpError('The phone number you entered already exists!', 400) );
                    }

                    return next(new HttpError(
                        'Signing up failed, error creating volunteer, please fill in all information and try again later.',
                        500
                    ));
                });
        })
        .catch(err => {
            console.log(err);
            return next(new HttpError(
                'Password was not hashed successfully, or password is not provided',
                500
            ));

        });

};

// password compare has issue: 
const login = async (req, res, next) => {

    Volunteer.findOne({ phone_number: req.body.phone_number })
        .then(volunteer => {
            if (!volunteer){
                const error = new HttpError(
                    'The volunteer user you tried to log in does not exist, please try a different phone number', 401
                );
                return next(error); 
            }
            bcrypt
                .compare(req.body.password, volunteer.password)
                .then((passwordCheck) => {

                    // check if password matches
                    if(!passwordCheck) {
                      return next(new HttpError('The password you entered does not match the phone number, please try again', 400));
                    }

                    //   create JWT token
                    const token = jwt.sign(
                        {
                            volunteerId: volunteer._id,
                            volunteerPhoneNumber: volunteer.phone_number,
                        },
                        "RANDOM-TOKEN",
                        { expiresIn: "24h" }
                    );

                    //   return success response
                    res.status(200).send({
                        message: "Login Successful",
                        phone_number: volunteer.phone_number,
                        token,
                    });
                })
                .catch(err => {
                    console.log(err);
                    return next(new HttpError('The password you entered does not match the phone number, please try again', 400));
                });
        })
        .catch(err => {
            console.log(err);
            return next(new HttpError(
                'Failed to login due to something wrong with server, please try again later', 500
            ));
        });

};

exports.signup = signup;
exports.login = login;