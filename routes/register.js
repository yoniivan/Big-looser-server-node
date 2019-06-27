const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require('../Models/user');

router.post('/', (req, res, next) => {
    console.log("POST in register");
    console.log(req.body.isAdmin);
    User.find( {eMail: req.body.eMail} ).exec().then(result => {
        if (result.length > 0) {
            return res.status(409).json({
                message: "E-Mail alredy exsists"
            });
        }else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) { 
                    console.log(err)
                    return res.status(500).json({
                        message: err
                    });
                }else {
                    var user = null;
                    var game = null;
                    if (req.body.isAdmin == true){
                        user = new User({
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            eMail: req.body.eMail,
                            password: hash,
                            isAdmin: req.body.isAdmin,
                            groupName: req.body.eMail,
                        }); 

                    }else{
                        user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            eMail: req.body.eMail,
                            password: hash,
                            isAdmin: req.body.isAdmin,
                            groupName: 'No Group',
                        });

                    }
                    user.save().then(doc => {
                        res.status(201).json({
                            message: "User created"
                        });
                    }).catch(err => {
                        console.log(err)
                        res.status(500).json({
                            error: err
                        });
                    });
                }
            });
        }
    });
});

module.exports = router;