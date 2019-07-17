const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../Models/user');
const checkAuth = require('../../Middlware/check-auth');

router.get('/', checkAuth, (req, res, next) => {
    console.log('[TABLE]');
    var token = req.headers.authorization.split(' ')[1];
    var decode = jwt.verify(token, 'secret');
    console.log(decode.groupName);
    User.find({groupName: decode.groupName}).then(users => {
        let table = [];
        for(let i = 0; i<users.length; i++){
            let user = {
                firstName: users[i].firstName,
                lastName: users[i].lastName,
                totalScore: {
                    exactScore: 0,
                    zeroOne: 0,
                    twoThree: 0,
                    fourFive: 0,
                    sixPlus: 0,
                    direction: 0,
                    points: 0,
                }
            }
            for(let j = 0; j<users[i].gameInsert.length; j++){
                // STOPPED FROM HERE BUILD TABLE //
                user.totalScore.exactScore = user.totalScore.exactScore + users[i].gameInsert[j].totalScore.exactScore;
                user.totalScore.zeroOne = user.totalScore.zeroOne + users[i].gameInsert[j].totalScore.zeroOne
                user.totalScore.twoThree = user.totalScore.twoThree + users[i].gameInsert[j].totalScore.twoThree;
                user.totalScore.fourFive = user.totalScore.fourFive + users[i].gameInsert[j].totalScore.fourFive
                user.totalScore.sixPlus = user.totalScore.sixPlus + users[i].gameInsert[j].totalScore.sixPlus;
                user.totalScore.direction = user.totalScore.direction + users[i].gameInsert[j].totalScore.direction;
                user.totalScore.points = user.totalScore.points + users[i].gameInsert[j].totalScore.points;
            }
            table.push(user);
        }
        res.status(200).json(table);
    }).catch(err => {message: err});
});

module.exports = router;