var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    email: String,
    subject: String,
    message: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

schema.set('versionKey', false);

module.exports = mongoose.model('Feedback', schema, 'feedback');