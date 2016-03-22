var express = require('express');
var router = express.Router();
var utils = require('../config/utils');

var User = require('../models/User');
var Withdraw = require('../models/Withdraw');
var Media = require('../models/Media');

module.exports = function(passport) {
    router.get('/login', function(req, res) {
        return res.redirect('/#login');
    });

    router.post('/login', passport.authenticate('login', {
        successReturnToOrRedirect: '/myOrder',
        failureFlash: true
    }));

    router.get('/logout', function(req, res) {
        req.logOut();
        res.redirect('/');
    });

    router.get('/register', function(req, res) {
        return res.redirect('/#register');
    });

    router.post('/register', passport.authenticate('registerGuide', {
        successRedirect: '/orders',
        failureRedirect: '/#register',
        failureFlash: true
    }));

    router.get('/agree', function (req, res) {

        return res.render('content/agreement');

    });

    router.post('/agree', function (req, res) {

        User.findOne({_id: req.user.id}).exec(function (error, result) {

            result.has_agreed = true;

            result.save(function(err) {

                if (err) {

                    throw err;

                }

                var returnTo = req.session.return;

                req.session.return = null;

                return res.redirect(returnTo || '/orders');

            });


        });

    });

    router.get('/profile', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).populate('media_id').exec(function (err, result) {
            return res.render('content/profile', {
                profileMessage: req.flash('profileMessage'),
                profile: result
            });
        });

    });

    router.post('/profile', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).populate('media_id').exec(function (err, result) {

            result.email = req.param('alipay');

            result.first_name = req.param('firstname');

            result.last_name = req.param('lastname');

            result.wechat = req.param('wechat');

            result.qq = req.param('qq');

            result.phone = req.param('phone');

            result.introduction = req.param('introduction');

            result.description = req.param('description');

            if (result.media_id) {

                if (result.media_id.photos.length) {

                    result.media_id.photos[0] = req.param('photo');

                } else {

                    result.media_id.photos.push(req.param('photo'));

                }

                result.media_id.save(function(err) {

                    if (err) {

                        throw err;

                    }

                    result.save(function(err) {

                        if (err) {

                            throw err;

                        }

                        return res.redirect('/profile');

                    });

                });

            } else {

                Media.create({
                    photos: [req.param('photo')]
                }, function (err, media) {

                    result.media_id = media.id;

                    result.save(function(err) {

                        if (err) {

                            throw err;

                        }

                        return res.redirect('/profile');

                    });

                });

            }

        });

    });

    router.get('/wallet', utils.isAuthenticated, function (req, res) {

        return res.render('content/wallet', {
            walletMessage: req.flash('walletMessage')
        });

    });

    router.post('/wallet', utils.isAuthenticated, function (req, res) {

        var amount = parseFloat(req.param('withdraw'));

        if (amount <= req.user.balance) {

            Withdraw.create({
                amount: amount,
                requester: req.user.id
            }, function (err, withdraw) {

                if (err) throw err;

                req.flash('walletMessage', '钱包请求已发送。');

                return res.redirect('/wallet');

            });

        }

    });

    router.get('/forgot', function (req, res) {

        return res.render('content/forgotpassword');

    });

    router.post('/forgot', function (req, res) {
        res.writeHead(200, {'Content-Type': 'application/json'});

        User.findOne({email: req.body.email}).exec(function (error, result) {

            if (error || !result) {
                return res.end(JSON.stringify({
                    success: false,
                    message: '电子邮件不属于任何人。'
                }));
            }

            var newPassword = utils.getShortId().generate();

            result.password = utils.createHash(newPassword);

            result.save(function(err) {

                if (err) {

                    throw err;

                }

                utils.sendForgotPasswordMail(result.email, newPassword);

                return res.end(JSON.stringify({
                    success: true,
                    message: '临时密码已经发送到您的电子邮件收件箱。'
                }));

            });


        });

    });

    router.get('/changepassword', utils.isAuthenticated, function (req, res) {

        return res.render('content/changepassword', {
            changePasswordMessage: req.flash('changePasswordMessage')
        });

    });

    router.post('/changepassword', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).exec(function (error, user) {

            if (utils.isValidPassword(user, req.param('currentpassword'))) {

                if (req.param('confirmpassword') == req.param('newpassword')) {

                    user.password = utils.createHash(req.param('newpassword'));

                    user.save(function (error) {

                        if (error) {

                            throw error;

                        }

                        req.flash('changePasswordMessage', '你的密码被改了。');

                        return res.redirect('changepassword');

                    });

                } else {

                    req.flash('changePasswordMessage', '密码必须相符。');

                    return res.redirect('changepassword');

                }

            } else {

                req.flash('changePasswordMessage', '密码不正确。');

                return res.redirect('changepassword');

            }

        });

    });

    return router;
};