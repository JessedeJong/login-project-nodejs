const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const errorHandler = require('errorhandler');

// Add the mongoose promise as global promise
mongoose.promise = global.Promise;

// Configure production
const isProduction = process.env.NODE_ENV === 'production';

// Initiate the app
const app = express();

// Add configuration
app.use(cors());
app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'passport',
    cookie: {
        maxAge: 60000
    },resave: false,
    saveUninitialized: false
}));

if(!isProduction) {
    app.use(errorHandler());
}

// Mongoose configuration
mongoose.connect('mongodb://root:bGOhFHlAU8126C7e@ds259377.mlab.com:59377/oop', {
    useNewUrlParser: true
});
mongoose.set('debug', true);

// Models and routes
require('./models/Users');
require('./config/passport');
app.use(require('./routes'))

// Error handling
if(!isProduction) {
    app.use((err, req, res, next) => {
        res.status(err.status || 500);

        res.json({
            errors: {
                message: err.message,
                error: err,
            },
        });
    });
}

app.use((err, req, res, next) => {
    res.status(err.status || 500);

    res.json({
        errors: {
            message: err.message,
            error: {},
        },
    });
});

// Make app listen on port
app.listen(8000, () => console.log('Server running on port 8000'));