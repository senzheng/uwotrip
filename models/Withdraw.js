var mongoose = require('mongoose');
var utils = require('../config/utils');

var schema = new mongoose.Schema({
    amount: {type: Number, default: 0.0},
    requester: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
});

schema.set('versionKey', false);

module.exports = mongoose.model('Withdraw', schema, 'withdraw');