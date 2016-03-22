var mongoose = require('mongoose');
var utils = require('../config/utils');

var schema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    waiting_approval: Boolean,
    first_name: String,
    last_name: String,
    is_guide: Boolean,
    is_admin: Boolean,
    reviews: Array,
    ratings: Array,
    notifications: Array,
    introduction: String,
    description: String,
    wechat: String,
    qq: String,
    phone: String,
    join_date: {type: Date, default: Date.now},
    has_agreed: {type: Boolean, default: false},
    balance: {type: Number, default: 0.0},
    posts: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Destination'
    }],
    myplaces: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Destination'
    }],
    mytrips: [
        {
            carted: Boolean,
            checked_out: Boolean,
            generated: Boolean,
            days: Array,
            start_time: Date,
            start_address: String,
            people: Number,
            name: String,
            destinations: [{
                cant_delete: Boolean,
                name: String,
                minutes: Number,
                address: String,
                start_time: String,
                end_time: String,
                people: Number,
                destination_id: {
                    type: mongoose.Schema.ObjectId,
                    ref: 'Destination'
                }
            }]
        }
    ],
    media_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'Media'
    },
    employees: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    user_type: Number // 1 = Operator, 2 = Tour Operator, 3 = Local Guide, 4 = Official Guide, 5 = Tourist
});

schema.set('versionKey', false);

module.exports = mongoose.model('User', schema, 'user');