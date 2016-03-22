var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');


var preSchema = mongoose.Schema({
    
    _id              : String,  // order_id
    trip_id          : String,  // order_owner id
    trip_name        : String,
    order_status     : String,
    payment_status   : String,
    paid             : Number,
    status           : Number,
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
    }
   

});

// generating a hash
preSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
preSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Pre', preSchema);