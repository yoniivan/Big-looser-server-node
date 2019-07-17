const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../Models/user');
const checkAuth = require('../../Middlware/check-auth');

router.get('/', checkAuth, (req, res, next) => {
    var token = req.headers.authorization.split(' ')[1];
    var decode = jwt.verify(token, 'secret');
    console.log(decode._id);
    User.findOne({_id: decode._id}, 'message').then(data => {
        res.status(200).json({data});
    }).catch(err => {err});
});

router.post('/', checkAuth, (req, res, next) => {
    var token = req.headers.authorization.split(' ')[1];
    var decode = jwt.verify(token, 'secret');
    User.updateMany({groupName: decode.groupName}, {upsert: true,
        $set: {
            message: {
                title: req.body.title,
                message: req.body.message,
                date: Date.now(),
            }
        }
    }).then(data => {
        res.status(201).json({modified: data.nModified})
    }).catch(err => {err});
});


module.exports = router;