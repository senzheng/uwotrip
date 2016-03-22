var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var utils = require('../config/utils');

var User = require('../models/User');
var Destination = require('../models/Destination');
var Order = require('../models/Order');
var Feedback = require('../models/Feedback');
var Message = require('../models/Message');

module.exports = function () {

    router.get('/assignorders', utils.isAuthenticated, utils.isAdmin, function (req, res) {

        Order.find({completed: {$ne: true}})
            .populate('operator tour_operator trips.destinations.destination_id trips.destinations.destination_id.media_id')
            .exec(function (err, orders) {

                Order.populate(orders, {
                    path: 'trips.destinations.destination_id.media_id',
                    model: 'Media'
                }, function (err, result) {

                    //utils.addOrdersMinutes(result);

                    User.find({user_type: 2}).limit(20).populate('media_id').exec(function (err, users) {

                        return res.render('content/admin/assignorders', {
                            orders: result,
                            guides: users
                        });

                    });

                });

            });

    });

    router.post('/assignorders', utils.isAuthenticated, utils.isAdmin, function (req, res) {

        Order.findOne({_id: req.param('order')})
            .exec(function (err, order) {

                order.trips.forEach(function (trip, i) {

                    trip.days.forEach(function (day, j) {

                        day.forEach(function (waypoint, k) {

                            if (waypoint.destination_id == req.param('destination')) {

                                order.trips[i].days[j][k].guide = req.param('guide');

                            }

                        });

                    });

                });

                order.markModified('trips');

                order.save(function (error) {

                    if (error) {

                        throw error;

                    }

                    return res.json(JSON.stringify({
                        success: true
                    }));

                });

            });

    });

    router.post('/assignorders/touroperator', utils.isAuthenticated, utils.isAdmin, function (req, res) {

        Order.findOne({_id: req.param('order')})
            .exec(function (err, order) {

                order.tour_operator = req.param('guide');

                order.save(function (error) {

                    if (error) {

                        throw error;

                    }

                    return res.json(JSON.stringify({
                        success: true
                    }));

                });

            });

    });

    router.get('/account/create', utils.isAuthenticated, utils.isAdmin, function (req, res) {
        User.find({user_type: 2}).exec(function (error, tour_operators) {
            return res.render('content/admin/createaccount', {
                message: req.flash('message'),
                tour_operators: tour_operators
            });
        });
    });

    router.post('/account/create', utils.isAuthenticated, utils.isAdmin, function (req, res) {

        User.find().exec(function (error, users) {
            var match = false;

            users.forEach(function (existing) {
                if (existing.username == req.param('username')) {
                    match = true;
                }
            });

            if (match == false) {
                if (!req.param('password')) {
                    req.flash('message', 'Please enter a password.');

                    return res.redirect('/account/create');
                }

                User.create({
                    username: req.param('username'),
                    password: utils.createHash(req.param('password')),
                    first_name: req.param('firstname'),
                    last_name: req.param('lastname'),
                    phone: req.param('phone'),
                    wechat: req.param('wechat'),
                    email: req.param('alipay'),
                    user_type: req.param('usertype')
                }, function (error, user) {
                    User.findOne({_id: req.param('touroperator')}).exec(function (error, tour_operator) {

                        tour_operator.employees.push(user.id);

                        tour_operator.save(function (error) {
                            if (error) {
                                throw error;
                            }

                            req.flash('message', 'User ' + user.username + ' created with password ' + req.param('password') + '.');

                            return res.redirect('/account/create');
                        });

                    });
                });
            } else {
                req.flash('message', 'User ' + user.username + ' already exists.');

                return res.redirect('/account/create');
            }
        });
    });

    router.get('/approvedestinations', utils.isAuthenticated, utils.isAdmin, function (req, res) {

        Destination.find({
            is_hidden: true
        }).populate('owner').exec(function (err, destinations) {

            return res.render('content/approvedestinations', {
                destinations: destinations
            });

        });

    });

    router.post('/approvedestinations', utils.isAuthenticated, utils.isAdmin, function (req, res) {

        Destination.findOne({
            _id: req.param('id')
        }).exec(function (err, destination) {

            destination.is_hidden = false;

            destination.save(function (error) {

                if (error) {

                    throw error;

                }

                return res.redirect('/approvedestinations');

            });

        });

    });

    router.get('/approveguides', utils.isAuthenticated, utils.isAdmin, function (req, res) {

        User.find({
            waiting_approval: true
        }).exec(function (err, users) {

            return res.render('content/approveguides', {
                guides: users
            });

        });

    });

    router.post('/approveguides', utils.isAuthenticated, utils.isAdmin, function (req, res) {

        User.findOne({
            _id: req.param('id')
        }).exec(function (err, user) {

            user.waiting_approval = false;

            user.save(function (error) {

                if (error) {

                    throw error;

                }

                return res.redirect('/approveguides');
            });

        });

    });

    router.post('/searchguides', utils.isAuthenticated, utils.isAdmin, function (req, res) {

        var keywords = [];

        req.param('keyword').split(' ').forEach(
            function (keyword) {

                keyword = new RegExp(keyword.replace(/(.*?)/g, ''), 'i');

                if (keyword != '/(?:)/i') {

                    this.push(keyword);

                }

            },
            keywords
        );

        var query = {};

        if (keywords.length) {

            query.$or = [{
                'introduction': {
                    $in: keywords
                }
            }, {
                'description': {
                    $in: keywords
                }
            }, {
                'username': {
                    $in: keywords
                }
            }];

        }

        query.is_guide = true;

        User.find(query).limit(20).populate('media_id').exec(function (err, users) {

            res.writeHead(200, {'Content-Type': 'application/json'});

            return res.end(JSON.stringify({
                guides: users,
                success: true
            }));

        });

    });

    router.post('/gethelp', utils.isAuthenticated, function (req, res) {

        var destination = req.param('destination');

        Message.findOne({
            $and: [{
                who: {$in: [req.user.id]},
                who: {$in: ['56be2299f2b26c120299e541']}
            }]
        }).exec(function (err, message) {

            if (!message) {

                message = new Message({
                    who: [req.user.id, '56be2299f2b26c120299e541'],
                    messages: [{
                        sender: '56be2299f2b26c120299e541',
                        message: '您的问题将被转发到一个指南。',
                        target: req.user.id
                    }]
                });

            }

            message.subject = destination;

            message.save(function (error) {

                if (error) {

                    throw error;

                }

                return res.redirect('/messages/56be2299f2b26c120299e541');

            });


        });

    });

    router.get('/assignhelp', utils.isAuthenticated, utils.isAdmin, function (req, res) {

        Message.find({
            who: {$in: ['56be2299f2b26c120299e541']}
        }).populate('who').exec(function (err, messages) {

            User.find({is_guide: true}).limit(20).populate('media_id').exec(function (err, users) {

                return res.render('content/assignhelp', {
                    messages: messages,
                    guides: users
                });

            });


        });


    });

    router.post('/assignhelp', utils.isAuthenticated, utils.isAdmin, function (req, res) {

        var asker = req.param('asker').toString();
        var guide = req.param('guide').toString();

        Message.findOne({
            who: {
                $all: [asker, guide]
            }
        }).exec(function (err, existing) {

            Message.findOne({
                who: {
                    $all: [asker, '56be2299f2b26c120299e541']
                }
            }).exec(function (err, message) {


                if (existing) {

                    message.messages.forEach(function (element) {

                        if (element.sender == req.user.id) {

                            existing.messages.push(element);

                        }

                    });

                    existing.save(function (error) {

                        if (error) {

                            throw error;

                        }

                        message.remove();

                        res.writeHead(200, {'Content-Type': 'application/json'});

                        return res.end(JSON.stringify({
                            success: true
                        }));

                    });

                } else {

                    message.who.forEach(function (who, i) {

                        if (who == '56be2299f2b26c120299e541') {

                            message.who[i] = mongoose.Types.ObjectId(req.param('guide'));

                        }

                    });

                    message.messages.forEach(function (m, i) {

                        if (m.sender == '56be2299f2b26c120299e541') {

                            message.messages.splice(i, 1);

                        }

                    });

                    message.markModified('who');

                    message.save(function (error) {

                        if (error) {

                            throw error;

                        }

                        res.writeHead(200, {'Content-Type': 'application/json'});

                        return res.end(JSON.stringify({
                            success: true
                        }));

                    });

                }

            });

        });

    });

    router.get('/feedbacks', utils.isAuthenticated, utils.isAdmin, function (req, res) {

        Feedback.find().exec(function (err, result) {

            return res.render('content/feedbacks', {feedbacks: result});

        });

    });
    /*
     router.get('/assignorders', utils.isAuthenticated, utils.isAdmin, function (req, res) {

     Order.find({completed: {$ne: true}})
     .populate('operator trips.destinations.destination_id trips.destinations.destination_id.media_id')
     .exec(function (err, orders) {

     Order.populate(orders, {
     path: 'trips.destinations.destination_id.media_id',
     model: 'Media'
     }, function (err, result) {

     utils.addOrdersMinutes(result);

     User.find({is_guide: true}).limit(20).populate('media_id').exec(function (err, users) {

     return res.render('content/assignorders', {
     orders: result,
     guides: users
     });

     });

     });

     });

     });

     router.post('/assignorders', utils.isAuthenticated, utils.isAdmin, function (req, res) {

     Order.findOne({_id: req.param('order')})
     .exec(function (err, order) {

     order.trips.forEach(function (trip, i) {

     trip.days.forEach(function (day, j) {

     day.forEach(function (waypoint, k) {

     if (waypoint.destination_id == req.param('destination')) {

     order.trips[i].days[j][k].guide = req.param('guide');

     }

     });

     });

     });

     order.markModified('trips');

     order.save(function (error) {

     if (error) {

     throw error;

     }

     res.writeHead(200, {'Content-Type': 'application/json'});

     return res.end(JSON.stringify({
     success: true
     }));

     });

     });

     });
     */
    router.get('/disputes', utils.isAuthenticated, utils.isAdmin, function (req, res) {
        res.render('content/disputes', {});
    });

    router.get('/payguides', utils.isAuthenticated, utils.isAdmin, function (req, res) {
        res.render('content/payguides', {});
    });

    return router;
};