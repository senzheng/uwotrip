var mongoose = require('mongoose');
var utils = require('../config/utils');

var schema = new mongoose.Schema({
    _id: {
        type: String,
        unique: true,
        'default': utils.getShortId().generate
    },
    members: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    operator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    tourists: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    official_guides: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    tour_operator: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    official_guides_count: Number,
    hotel_level: Number,
    vehicle_type: Number,
    pin: Number,
    name: String,
    people: Number,
    generated: Boolean,
    additional_costs: [],
    booked: Boolean,
    ready: Boolean,
    trip: Array,
    destinations: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Destination'
    }],
    start_time: Date,
    start_address: {type: String, default: '1 World Way, Los Angeles, CA 90045'},
    end_address: String,
    total: Number,
    paid: Number,
    order_status: {type: String, default: 'Pending'},
    payment_status: {type: String, default: 'Unpaid'},
    canceled: Boolean,
    completed: Boolean,
    disputes: [{
        message: String,
        author: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    }],
    on_hold: Boolean,
    charge_id: String
});

schema.set('versionKey', false);

module.exports = mongoose.model('Order', schema, 'order');