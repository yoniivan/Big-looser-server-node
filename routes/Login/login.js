const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserLooser = require('/home/yoni/projects/react/big-looser-node/userLoosers.js');

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

router.post('/', (req, res, next) => {
    console.log('Login');
    UserLooser.find( {eMail: req.body.eMail} ).exec()
    .then(user => {
        if (user.length < 1) {
            return res.status(401).json({
                message: 'No such user'
            });
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
                return res.status(401).json({
                    message: 'Bcrypt failed'
                });
            }if (result) {
                const payload = {
                    firstName: user[0].firstName,
                    lastName: user[0].lastName,
                    eMail: user[0].eMail,
                    _id: user[0]._id,
                }
                const token = jwt.sign(payload, "secret",
                {
                    expiresIn: '3h'
                });
                res.status(200).json({
                    message: 'You are login',
                    token: token,
                    firstName: user[0].firstName,
                    lastName: user[0].lastName,
                    email: user[0].eMail,
                    ID: user[0]._id
                });
            }else {
                res.status(401).json({
                    message: 'Your password is incorect'
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