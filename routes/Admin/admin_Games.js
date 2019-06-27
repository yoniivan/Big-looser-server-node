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
            if(d.firstTeamBet == -1 && d.secondTeamBet == -1){
                arr.push(d);
            }
        })
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
            console.log('[find]');
            
            const exactScore = 0;
            const zeroOne = 0;
            const twoThree = 0;
            const fourFive = 0;
            const sixPlus = 0;
            const direction = 0;
            let points = 0;
            
            for(let i = 0; i<find.length; i++){
                for(let j = 0; j<find[i].gameInsert.length; j++){
                    if(!find[i].gameInsert[j].isCalculated){ // IF NOT CALCULATED
                        const firstTeamBet = find[i].gameInsert[j].firstTeamBet;
                        const secondTeamBet = find[i].gameInsert[j].secondTeamBet;

                        const endResultFirst = find[i].gameInsert[j].endResultFirst;
                        const endResultSecond = find[i].gameInsert[j].endResultSecond;

                        const totalGoalsInGame = endResultFirst + endResultSecond;
                        const userTotalGoalsBet = firstTeamBet + secondTeamBet
                        const bingo = isExactScore(firstTeamBet, secondTeamBet, endResultFirst, endResultSecond);
                        if(bingo){ ////////// EXACT_SCORE /////////
                            if(totalGoalsInGame == 0 || totalGoalsInGame == 1){
                                exactScore = 1;
                                points = ZERO_ONE + EXACT_SCORE;
                            }
                            else if(totalGoalsInGame == 2 || totalGoalsInGame == 3){
                                exactScore = 1;
                                points = ONE_TWO + EXACT_SCORE;
                            }
                            else if(totalGoalsInGame == 4 || totalGoalsInGame == 5){
                                exactScore = 1;
                                points = FOUR_FIVE + EXACT_SCORE;
                            }
                            else if(totalGoalsInGame >= 6){
                                exactScore = 1;
                                points = SIX_PLUS + EXACT_SCORE;
                            }
                        }else{
                            ////////// NOT EXACT_SCORE /////////
                            if(userTotalGoalsBet == totalGoalsInGame){ // GOALS_AMOUNT //
                                if(userTotalGoalsBet == 0 || totalGoalsInGame == 1){
                                    zeroOne = 1;
                                    points = ZERO_ONE;
                                }
                                else if(userTotalGoalsBet == 2 || userTotalGoalsBet == 3){
                                    twoThree = 1;
                                    points = TWO_THREE
                                }
                                else if(userTotalGoalsBet == 4 || userTotalGoalsBet == 5){
                                    fourFive = 1;
                                    points = FOUR_FIVE;
                                }
                                else if(userTotalGoalsBet >= 6){
                                    sixPlus = 1; 
                                    points = SIX_PLUS;       
                                }
                            }
                            ////////// DIRECTION /////////
                            if((endResultFirst > endResultSecond && firstTeamBet > secondTeamBet) || (endResultFirst < endResultSecond && firstTeamBet < secondTeamBet)){
                                direction = 1;
                                points = totalScore.points + DIRECTION_NOT_EQUAL;
                            }
                            else if(endResultFirst == endResultSecond && firstTeamBet == secondTeamBet){
                                direction = 1;
                                points = totalScore.points + DIRECTION_EQUAL;
                            }
                        }
                    }
                    console.log(points)
                    await User.updateOne({eMail: find[i].eMail}, {$set: {
                        "exactScore.$[el].exactScore": exactScore,
                        "exactScore.$[el].zeroOne": zeroOne,
                        "exactScore.$[el].twoThree": twoThree,
                        "exactScore.$[el].fourFive": fourFive,
                        "exactScore.$[el].sixPlus": sixPlus,
                        "exactScore.$[el].direction": direction,
                        "exactScore.$[el].points": points}}
                        ,{upsert: true, arrayFilters: [{$and: [
                            {"el.firstTeam": req.body.firstTeamBet},
                            {"el.secondTeam": req.body.secondTeamBet}
                        ]}]}).exec();
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
}




module.exports = router;




// router.put('/', checkAuth, (req, res, next) => {
//     var token = req.headers.authorization.split(' ')[1];
//     var decode = jwt.verify(token, 'secret');
//     ////// DELETE GAME ////////
//     if(!req.body.isUpdate){
//         console.log('[DELETE] - ' + req.body.isUpdate);
//         User.updateMany(
//             {groupName: decode.groupName},
//             {$pull: {gameInsert: {$and: [
//                 {_id: req.body.gameId}
//             ]}}}).then(data => {res.status(201).json({message: 'Game was deleted'})})
//             .catch(err => {message: err});
//     ///////// UPDATE GAME ///////////
//     }else{
//         console.log('[UPDATE] - ' + req.body.isUpdate);
//         console.log('[gameId] - ' + req.body.gameId);
//         User.updateMany({groupName: decode.groupName}, 
//             {$set: {
//                 "gameInsert.$[el].endResultFirst": Number(req.body.endResultSecond), 
//                 "gameInsert.$[el].endResultSecond": Number(req.body.endResultFirst)}}, 
//             {arrayFilters: [{$and: [
//                 {"el.firstTeam": req.body.firstTeam},
//                 {"el.secondTeam": req.body.secondTeam}
//             ]}
//             ]}).then(data => {
//                 console.log(data);
//                  res.status(201).json({message: 'Bet updated'});
//              }).catch(err => {message: err});
//     }
// });