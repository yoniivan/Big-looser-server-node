const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    firstName: {type: String},
    lastName: {type: String},
    eMail: {type: String},
    password: {type: String},
    isAdmin: {type: Boolean},
    groupName: {type: String, default: 'No group'},
    gameInsert: [{
        firstTeam: {type: String},
        secondTeam: {type: String},
        startTime:  {type: Date, default: Date.now},
        firstTeamBet: {type: Number, default: -1},
        secondTeamBet: {type: Number, default: -1},
        winningTeam: {type: String},
        totalGoals: {type: String},
        endResultFirst: {type: Number, default: -1},
        endResultSecond: {type: Number, default: -1},

        isCalculated: {type: Boolean, default: false},
        totalScore: {
            exactScore: {type: Number, default: 0},
            zeroOne: {type: Number, default: 0},
            twoThree: {type: Number, default: 0},
            fourFive: {type: Number, default: 0},
            sixPlus: {type: Number, default: 0},
            direction: {type: Number, default: 0},
            points: {type: Number, default: 0},
        },
    }],
});

module.exports = mongoose.model('User', userSchema);