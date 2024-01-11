const HttpError = require('../../models/http_error');
const Volunteer = require('../../models/volunteers');
const bcrypt = require('bcrypt');

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
                        'Signing up failed, error creating volunteer, please try again later.',
                        500
                    ));
                });

        })
        .catch(err => {
            console.log(err);
            return next(new HttpError(
                'Password was not hashed successfully',
                500
            ));

        });


};

const login = async (req, res, next) => {

};

exports.signup = signup;
exports.login = login;