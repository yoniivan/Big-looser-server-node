const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../Models/user');
const checkAuth = require('../../Middlware/check-auth');

/// GET Beting games ///////
router.get('/', checkAuth, (req, res, next) => {
    console.log('GET all UnbetedGames');
    var token = req.headers.authorization.split(' ')[1];
    
    var decode = jwt.verify(token, 'secret');
    User.find({_id: decode._id}, 'gameInsert').exec().then(doc => {
        let arr = [];
        doc[0].gameInsert.map(d => {
            if(d.startTime > Date.now()){
                arr.push(d);
            }
        })
        console.log(arr);
        res.status(200).json({
            games: arr,
            numberOfGames: arr.length
        });
    }).catch(err => {
        res.status(500).json({
            message: err
        });
    })
})


//// UPDATE BETS /////
router.put('/', checkAuth, (req, res, next) => {
    console.log('[Update bet]');
    var token = req.headers.authorization.split(' ')[1];
    var decode = jwt.verify(token, 'secret');
    const id = decode._id;
    // AND OPERATOR WITH DATE DOSEN'T WORK //
    User.updateOne({_id: id}, 
                {$set: {
                    "gameInsert.$[el].firstTeamBet": req.body.firstTeamBet, 
                    "gameInsert.$[el].secondTeamBet": req.body.secondTeamBet,
                    "gameInsert.$[el].winningTeam": req.body.winningTeam,
                    "gameInsert.$[el].totalGoals": req.body.totalGoals}}, 
                {upsert: true, arrayFilters: [{$and: [
                    {"el.firstTeam": req.body.firstTeam},
                    {"el.secondTeam": req.body.secondTeam}
                ]}
                ]}).then(data => {
                     res.status(201).json({message: 'Bet updated'});
                 }).catch(err => {message: err});
})

module.exports = router;