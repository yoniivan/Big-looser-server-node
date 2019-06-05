const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const login = require('./routes/Login/login');
const register = require('./routes/Login/register');

mongoose.connect('mongodb+srv://yoniivan:' + 'yoni231252' + '@cluster0-adopv.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
})

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    if (res.method === "OPTIONS") {
        res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
        return res.status(200).json({});
    }
    next();
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/login', login);
app.use('/register', register);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    console.log("MiddlewareApp");
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
            line: "line 33",
        }
    });
});

module.exports = app;