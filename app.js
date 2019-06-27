const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const login = require('./routes/login');
const register = require('./routes/register');
const insertGame = require('./routes/Admin/admin_Games');
const users = require('./routes/Admin/admin_users');
const games_simple = require('./routes/User_simple/games_simple');

mongoose.connect('mongodb+srv://yoniivan:' + 'yoni231252' + '@cluster0-adopv.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
})

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    if (res.method === "OPTIONS") {
        return res.status(200).json({
            message: 'Headers [APP.js]',
        });
    }
    next();
});

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/login', login);
app.use('/register', register);
app.use('/gameinsert', insertGame);
app.use('/users', users);
app.use('/games_simple', games_simple);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message,
            line: "[APP.js]",
            statusCode: error.status,
        }
    });
});

module.exports = app;


//npm start