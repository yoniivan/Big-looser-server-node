const mongoose = require('mongoose');

const userLooserSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    firstName: String,
    lastName: String,
    eMail: String,
    password: String
});

module.exports = mongoose.model('User', userLooserSchema);