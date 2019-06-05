const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const router = express.Router();

const User = require('/home/yoni/projects/react/big-looser-node/userLoosers.js');

router.post('/', (req, res, next) => {
    console.log("POST in register");
    console.log(req.body.password);
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
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        eMail: req.body.eMail,
                        password: hash
                    });
                    user.save().then(doc => {
                        console.log(doc);
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