const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../../Models/user');
const checkAuth = require('../../Middlware/check-auth');

const EXACT_SCORE = 4;
const DIRECTION_EQUAL = 2;
const DIRECTION_NOT_EQUAL = 1;
const ZERO_ONE = 2;
const TWO_THREE = 1;
const FOUR_FIVE = 3;
const SIX_PLUS = 3;


/////////// UPDATE NEW GAMES /////////////
router.post('/', (req, res, next) => {
    console.log('[UPDATE NEW GAMES]');
    console.log('GroupName: ' + req.body.teamOne);
    User.updateMany(
        {groupName: req.body.groupName}, 
        {$push: {gameInsert: {
            firstTeam: req.body.teamOne,
            secondTeam: req.body.teamTwo,
            startTime:  req.body.nodeDate
        }}}).exec().then(data => {
            res.status(200).json({message: 'Updated', users: data});
        }).catch(err => {error: err});
});

//////// SELECT ALL GAMES THAT ARE UNBETED /////////////
router.get('/', checkAuth, (req, res, next) => {
    var token = req.headers.authorization.split(' ')[1];
    var decode = jwt.verify(token, 'secret');
    User.find({_id: decode._id}).then(data => {
        let arr = [];
        data[0].gameInsert.map(d => {
            if(d.endResultFirst == -1 && d.endResultSecond == -1){
                arr.push(d);
            }
        })
        console
        res.status(200).json({arr});
    }).catch(err => {error: err});
});

//////////// REMOVE GAME ////////////
router.put('/', checkAuth, (req, res, next) => {
    var token = req.headers.authorization.split(' ')[1];
    var decode = jwt.verify(token, 'secret');
    ////// DELETE GAME ////////
    if(!req.body.isUpdate){
        console.log('[DELETE] - ' + req.body.isUpdate);
        User.updateMany(
            {groupName: decode.groupName},
            {$pull: {gameInsert: {$and: [
                {_id: req.body.gameId}
            ]}}}).then(data => {res.status(201).json({message: 'Game was deleted'})})
            .catch(err => {message: err});
    ///////// UPDATE GAME ///////////
    }else{
        console.log('[UPDATE] - ' + req.body.isUpdate);
        let updateEndResult = async(groupName) =>{
            const update = await User.updateMany({groupName: groupName}, 
                {$set: {
                    "gameInsert.$[el].hasBeanUpdated": true,
                    "gameInsert.$[el].endResultFirst": Number(req.body.endResultFirst), 
                    "gameInsert.$[el].endResultSecond": Number(req.body.endResultSecond)}}, 
                {arrayFilters: [{$and: [
                    {"el.firstTeam": req.body.firstTeam},
                    {"el.secondTeam": req.body.secondTeam}
                ]}
                ]}).exec();
                return update 
        }
        updateEndResult(decode.groupName);
        let findAllUsers = async(groupName) => {
            console.log('[findAllUsers]');
            const find = await User.find({groupName: groupName}).exec();
            for(let i = 0; i<find.length; i++){
                for(let j = 0; j<find[i].gameInsert.length; j++){
                    console.log('[isCalculated] - ' + find[i].gameInsert[j].isCalculated)
                    if((find[i].gameInsert[j].isCalculated == false)){
                        let totalScore = {
                            exactScore: 0,
                            zeroOne: 0,
                            twoThree: 0,
                            fourFive: 0,
                            sixPlus: 0,
                            direction: 0,
                            points: 0,
                        }
                        const firstTeamBet = find[i].gameInsert[j].firstTeamBet;
                        const secondTeamBet = find[i].gameInsert[j].secondTeamBet;
                        const endResultFirst = find[i].gameInsert[j].endResultFirst;
                        const endResultSecond = find[i].gameInsert[j].endResultSecond;
                        const bingo = isExactScore(firstTeamBet, endResultFirst, secondTeamBet, endResultSecond);
                        const goals = checkGoals(endResultFirst, endResultSecond, find[i].gameInsert[j].totalGoals);
                        const direction = checkDirection(endResultFirst, endResultSecond, find[i].gameInsert[j].firstTeam, find[i].gameInsert[j].secondTeam, find[i].gameInsert[j].winningTeam);
                        // EXACT_SCORE // 
                        if(bingo && direction > 0 && goals > -1){
                            totalScore.exactScore = 1;
                            totalScore.points = goals + EXACT_SCORE;
                        }else {
                            /// GOALS ///
                            if(goals > -1){
                                    totalScore.zeroOne = 1;
                                    totalScore.points = goals;
                            }
                            /// DIRECTION ///
                            if(direction == 1){
                                totalScore.direction = 1;
                                totalScore.points = totalScore.points + direction;
                            }
                        }
                        let score = async(id) => {
                        const update2 = await User.updateOne({_id: id}, {$set: {
                                "gameInsert.$[el].isCalculated": true,
                                "gameInsert.$[el].totalScore.exactScore": totalScore.exactScore, 
                                "gameInsert.$[el].totalScore.zeroOne": totalScore.zeroOne,
                                "gameInsert.$[el].totalScore.twoThree": totalScore.twoThree, 
                                "gameInsert.$[el].totalScore.fourFive": totalScore.fourFive,
                                "gameInsert.$[el].totalScore.sixPlus": totalScore.sixPlus, 
                                "gameInsert.$[el].totalScore.direction": totalScore.direction, 
                                "gameInsert.$[el].totalScore.points": totalScore.points
                            }}, 
                            {upsert: true, arrayFilters: [{$and: [
                                {"el.firstTeam": find[i].gameInsert[j].firstTeam},
                                {"el.secondTeam": find[i].gameInsert[j].secondTeam}
                            ]}
                            ]}).exec();
                            return update2;
                        }
                        score(find[i]._id);
                    }

                }
                
            }
        }
        findAllUsers(decode.groupName).then(data => {
            res.status(201).json({message: 'Score was updated in all users'})})
            .catch(err => {error: err});
    }
});

///////////// BETTING FUNCTIONS ////////////
const isExactScore = (x1, x2, y1, y2) => {
    if((x1 == x2) && (y1 == y2))
        return true;
    return false;
};

const totalGoals = (x1, x2) => {
    return x1 + x2;   
};

const checkDirection = (x1, x2, team1, team2, direction) => {
    if(x1 == x2 && direction == 'Draw')
        return DIRECTION_EQUAL;
    if((x1 > x2 && direction == team1) || (x1 < x2 && direction == team2))
        return DIRECTION_NOT_EQUAL;   
    return -1;     
};

const checkGoals = (x1, x2, totalGoals) => {
    const goals = x1 + x2;
    if((goals == 0 || goals == 1) && (totalGoals == 1))
        return ZERO_ONE;
    if((goals == 2 || goals == 3) && (totalGoals == 3))
        return TWO_THREE;
    if((goals == 4 || goals == 5) && (totalGoals == 5))
        return FOUR_FIVE;
    if(goals >= 6 && totalGoals == 6)
        return SIX_PLUS;  
    return -1;
}


module.exports = router;


                            // if(totalGoals(endResultFirst, endResultSecond) == 0 || totalGoals(endResultFirst, endResultSecond) == 1){
                            //     totalScore.exactScore = 1;
                            //     totalScore.points = ZERO_ONE + EXACT_SCORE;
                            //     console.log('[0-1]' + totalGoals(endResultFirst, endResultSecond))
                            // }else if(totalGoals(endResultFirst, endResultSecond) == 2 || totalGoals(endResultFirst, endResultSecond) == 3){
                            //     totalScore.exactScore = 1;
                            //     totalScore.points = TWO_THREE + EXACT_SCORE;
                            //     console.log('[2-3]' + totalGoals(endResultFirst, endResultSecond))
                            // }else if(totalGoals(endResultFirst, endResultSecond) == 4 || totalGoals(endResultFirst, endResultSecond) == 5){
                            //     totalScore.exactScore = 1;
                            //     totalScore.points = FOUR_FIVE + EXACT_SCORE;
                            //     console.log('[4-5]' + totalGoals(endResultFirst, endResultSecond))
                            // }else if(totalGoals(endResultFirst, endResultSecond) >= 6){
                            //     totalScore.exactScore = 1;
                            //     totalScore.points = SIX_PLUS + EXACT_SCORE;
                            //     console.log('[6+]' + totalGoals(endResultFirst, endResultSecond))
                            // }