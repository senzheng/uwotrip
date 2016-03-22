var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

function validator (v) {
  return v.length < 1000;
};

// define the schema for our user model
var reviewSchema = mongoose.Schema({
    _id             : String,  // user id
    //type:{type : Number, enum: [1,2,3,4,5]}, // 1: Operator 2 : Tour operator 3 : local guide 4 : official guide 5 : Tourist
    reviews : [{
        trip_id :  String,  // the trip id
        trip_name : String, // the trip name
        content : [{
            type: {type : Number, enum: [1,2,3]},
            place_id : {type: String, default: null},
            place_name: {type: String, default: null}, // 1: local guide 2 : official guide 3 : places 4 : Tour Operator
            _id : String, // the id is for the type of which being reviewed
            name : String, // the review_object name
            rating : {type : Number, enum: [0 , 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5], default: null},  // 0 - 5 interval : 0.5
            details : { type: String, validate: [validator, 'my error type'] , default: ""},// 1000 Charactor
            time : {type : Date, default: null}, // submit time
            status : {type : Number, enum: [1,2,3],  default: 1}  // 1. waiting 2. unfinished 3. finished
        }]
    }]
});




// generating a hash
reviewSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
reviewSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('Review', reviewSchema);
