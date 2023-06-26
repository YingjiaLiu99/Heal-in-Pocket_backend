const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

require('dotenv').config();

const doctorRoutes = require('./routes/doctor_routes');
const patientRoutes = require('./routes/patient_routes');
const recordRoutes = require('./routes/record_routes');
const HttpError = require('./models/http_error');

const app = express();

app.use(bodyParser.json());

app.use('/api/v1.0/doctor', doctorRoutes);
app.use('/api/v1.0/patient', patientRoutes);
app.use('/api/v1.0/record', recordRoutes);


// this is not a 'error handling middleware', but its used to catch default routes
// not found error
app.use((req, res, next) => {
    const error = new HttpError(
        'Invalid route! Could not find this route', 404
    );
    return next(error);
});


// error handling middleware function that will only be executed
// if any above middleware function yield an error
app.use((error, req, res, next) => {
    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({message: error.message || 'An unknown error occured!'});
});

mongoose.connect(process.env.DB_URL)
.then(() => {
    app.listen(5001);
})
.catch(err => {
    console.log(err);
});

