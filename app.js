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
const table_simple  = require('./routes/User_simple/table_simple');
const admin_message = require('./routes/Admin/admin_message'); 

mongoose.connect('mongodb+srv://'+ process.env.USER + ':' + process.env.MONGO_ATLAS_PW + '@cluster0-adopv.mongodb.net/test?retryWrites=true', {
    useNewUrlParser: true
})

app.use((req, res, next) => {
    // console.log(process.env);
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
app.use('/table', table_simple);
app.use('/message', admin_message);


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