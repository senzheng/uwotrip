var mongoose = require('mongoose');
var utils = require('../config/utils');

var schema = new mongoose.Schema({
    who: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    messages: [{
        sender: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        timestamp: {
            type: Date, default: Date.now
        },
        message: String,
        target: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    }],
    subject: String
});

schema.set('versionKey', false);

module.exports = mongoose.model('Message', schema, 'message');