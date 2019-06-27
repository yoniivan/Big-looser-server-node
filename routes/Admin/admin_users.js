const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../Models/user');
const checkAuth = require('../../Middlware/check-auth');

router.get('/', checkAuth, (req, res, next) => {
    console.log('GET all users');
    var token = req.headers.authorization.split(' ')[1];
    var decode = jwt.verify(token, 'secret');
    User.find({groupName: decode.groupName}).exec().then(doc => {
        res.status(200).json(doc);
    }).catch(err => {
        res.status(500).json({
            message: err
        });
    })
})

router.post('/', (req, res, next) => {
    console.log('[USERS]');
    User.findOne({eMail: req.body.email}).then(data => {
        res.status(200).json({
            id: data._id,
            email: data.eMail,
            firstName: data.firstName,
            lastName: data.lastName,
            groupName: data.groupName,
        });
    }).catch(err => {
        res.status(500).json({message: err});
    })
})

router.put('/', (req, res, next) => {
    console.log('[CHANGE_GROUP]');
    console.log(req.body.toggle);
    if (req.body.toggle){
        User.findByIdAndUpdate({_id: req.body.id}, {$set: {groupName: req.body.groupName}}).then(doc => {
            console.log(doc);
            res.status(201).json({
                message: 'User was added',
                id: doc._id,
                email: doc.eMail,
                firstName: doc.firstName,
                lastName: doc.lastName,
                groupName: doc.groupName,
                isAdmin: doc.isAdmin,
            });
        }).catch(err => {
            error: err;
        });
    }else{
        User.findByIdAndUpdate({_id: req.body.id}, {$set: {groupName: 'No group'}}).then(doc => {
            res.status(201).json({
                message: 'User was added',
                id: doc._id,
                email: doc.eMail,
                firstName: doc.firstName,
                lastName: doc.lastName,
                groupName: doc.groupName,
                isAdmin: doc.isAdmin,
            });
        }).catch(err => {
            error: err;
        });
    }


});



module.exports = router;