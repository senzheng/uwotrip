var LocalStrategy = require('passport-local').Strategy;
var User = require('../../models/User');
var bCrypt = require('bcrypt-nodejs');
var utils = require('../utils');

module.exports = function (passport) {
    passport.use('login', new LocalStrategy({
            passReqToCallback: true
        },
        function (req, username, password, done) {
            function login() {
                User.findOne({'username': username},
                    function (err, user) {
                        if (err) {
                            return done(err);
                        }

                        req.session.returnTo = utils.getParameterByName('r', req.header('referer'));

                        if (!user || !utils.isValidPassword(user, password)) {
                            req.flash('loginMessage', '无效的用户名或密码。');
                            return req.res.redirect(req.session.returnTo ? '/?r=' + req.session.returnTo + '#login' : '/#login');
                        }

                        if (user.is_admin && !req.session.returnTo) {

                            req.session.returnTo = '/notifications';

                        }

                        return done(null, user);
                    }
                );
            }

            process.nextTick(login);
        })
    );
}