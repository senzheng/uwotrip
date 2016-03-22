var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    tags: [String],
    is_hidden: Boolean,
    title: {
        en: String,
        cn: String
    },
    introduction: String,
    description: String,
    photos: {type: [String], default: ['http://www.davidluke.com/wp-content/themes/david-luke/media/ims/placeholder720.gif']},
    reviews: Array,
    ratings: Array,
    score: Number,
    address: String,
    minutes: {type: Number, default: 90},
    admission: String,
    phone: String,
    website: String,
    post_date: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    media_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Media'
    }
});

schema.set('versionKey', false);

module.exports = mongoose.model('Destination', schema, 'destination');

