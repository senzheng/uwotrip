var login = require('./login');
var signup = require('./register');
var User = require('../../models/User');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id).exec(function (err, user) {
            done(err, user);
        });
    });

    login(passport);
    signup(passport);
};