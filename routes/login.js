const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserLooser = require('../Models/user');


////////////// Testing /////////////
router.get('/', (req, res, next) => {
    console.log('GET all users');
    UserLooser.find().exec().then(doc => {
        res.status(200).json(doc);
    }).catch(err => {
        res.status(500).json({
            message: err
        });
    })
})

////////// TESTING /////////////
router.delete('/', (req, res, next) => {
    UserLooser.remove({groupName: req.body.groupName}).exec().then(doc => {
        res.status(200).json(doc);
    }).catch(err => {
        res.status(500).json({
            message: err
        });
    })
})


//////////// LOGIN /////////////
router.post('/', (req, res, next) => {
    console.log('Login');
    UserLooser.findOne( {eMail: req.body.eMail}, '_id eMail firstName lastName isAdmin groupName password').exec()
    .then(user => {
        if (user == null) {
            return res.status(401).json({
                message: 'No such user'
            });
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
            if (err) {
                return res.status(402).json({
                    message: 'Bcrypt failed',
                    status: 402,
                });
            }if (result) {
                const payload = {
                    _id: user._id,
                    eMail: user.eMail,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: user.isAdmin,
                    groupName: user.groupName,
                }
                const token = jwt.sign(payload, "secret",
                {
                    expiresIn: '3h'
                });
                res.status(200).json({
                    message: 'You are login',
                    token: token,
                });
            }else {
                res.status(401).json({
                    message: 'Your password is incorect',
                    status: 401,
                });
            }
        });
    }).catch(err => {
        console.log(err);
        res.status(501).json({
            message: err
        })
    });
    
});

module.exports = router;