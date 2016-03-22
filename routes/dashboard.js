var express = require('express');
var router = express.Router();
var utils = require('../config/utils');

var User = require('../models/User');
var Order = require('../models/Order');
var Destination = require('../models/Destination');
var Media = require('../models/Media');

module.exports = function () {

    router.get('/order/review', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).exec(function (err, result) {

            utils.addMinutes(result, true);

            return res.render('content/orderreview', {trips: result.mytrips, total: result.mytrips.total});

        });

    });

    router.get('/order/:id', utils.isAuthenticated, function (req, res) {

        Order.findOne({_id: req.params['id']}).exec(function (err, result) {

            var orders = [result];

            utils.addOrdersMinutes(orders);

            return res.render('content/orderdetails', {
                trips: orders[0].trips,
                total: orders[0].trips.total,
                estimate: orders[0].estimate,
                paid: orders[0].paid,
                id: orders[0].id
            });

        });

    });

    router.get('/orders/trip/:id', utils.isAuthenticated, function (req, res) {

        Order.findOne({'trips._id': req.params['id']}).populate('trips.destinations.destination_id').select('trips').exec(function (err, result) {

            if (err || !result) {
                return res.redirect('/orders');
            }

            var trip = result.trips.filter(function (trip) {
                return trip.id == req.params['id'];
            })[0];

            Order.populate(trip, {
                path: 'destinations.destination_id.media_id',
                model: 'Media'
            }, function (err, result) {

                var count = 0;

                var stopAt = 0;

                result.days.forEach(function (day) {

                    day.forEach(function (waypoint, i) {

                        if (i != 0) {

                            stopAt++;

                        }

                    });

                });

                result.days.forEach(function (day, i) {

                    var previousAddress;

                    day.forEach(function (waypoint, j) {

                        result.destinations.forEach(function (destination, k) {

                            if (waypoint.destination_id == destination.id) {


                                if (j != 0) {

                                    utils.getDistance().get({
                                            origin: previousAddress,
                                            destination: destination.address,
                                            language: 'zh-CN',
                                            units: 'imperial'
                                        },
                                        function (err, data) {

                                            result.days[i][j].travel = '旅程距离/时间: ' + data.distance + ', ' + data.duration;

                                            count++;

                                            if (count >= stopAt) {

                                                return res.render('content/tripdetails', {
                                                    trip: result,
                                                    back: '/orders'
                                                });

                                            }

                                        });

                                }

                                previousAddress = destination.address;

                            }

                        });

                    });

                });

            });

        });


    });


    router.get('/orders', utils.isAuthenticated, function (req, res) {

        var query;


        Order.find({}).populate('operator tour_operator official_guides').exec(function (error, orders) {


            return res.render('content/printJson', {
                orders: orders
            });

        });

    });

    router.post('/payorder', utils.isAuthenticated, function (req, res) {

        res.writeHead(200, {'Content-Type': 'application/json'});

        var stripeToken = req.body.token;

        var amount = req.body.amount;

        var oid = req.body.oid;

        if (stripeToken) {

            var charge = utils.getStripe().charges.create({
                amount: amount, // amount in cents
                source: stripeToken,
                description: 'Uwo Trip payment from: ' + req.user.email,
                currency: 'usd'
            }, function (err, charge) {

                if (err && err.type === 'StripeCardError') {

                    return res.end(JSON.stringify({
                        success: false
                    }));

                }

                if (charge) {

                    Order.findOne({_id: oid}).exec(function (error, result) {

                        result.paid += parseInt(amount);

                        result.payment_status = '已经支付';

                        result.save(function (error) {

                            if (error) {

                                throw error;

                            }

                            return res.end(JSON.stringify({
                                success: true,
                                order: oid
                            }));

                        });

                    });

                }

            });

        }

    });

    router.post('/contact', function (req, res) {

        User.findOne({username: req.body.gid})
            .exec(function (error, result) {
                res.writeHead(200, {'Content-Type': 'application/json'});

                return res.end(JSON.stringify({
                    success: true,
                    fullname: result.first_name && result.last_name ? result.first_name + ' ' + result.last_name : '',
                    phone: result.phone,
                    wechat: result.wechat,
                    qq: result.qq,
                    email: result.email,
                    id: result.id
                }));

            });

    });

    router.get('/destination/manage', utils.isAuthenticated, function (req, res) {
        if (!req.user.is_guide) {
            return res.redirect('/orders');
        }

        User.findOne({_id: req.user.id})
            .populate('posts')
            .exec(function (error, result) {

                return res.render('content/managedestinations', {
                    destinations: result.posts
                });

            });

    });

    router.get('/destination/create', utils.isAuthenticated, function (req, res) {

        return res.render('content/editdestination', {
            action: '/destination/create'
        });

    });

    router.post('/destination/create', utils.isAuthenticated, function (req, res) {

        var photos = [];

        if (req.param('photo1').length) {

            photos.push(req.param('photo1'));

        }

        if (req.param('photo2').length) {

            photos.push(req.param('photo2'));

        }

        if (req.param('photo3').length) {

            photos.push(req.param('photo3'));

        }

        if (req.param('photo4').length) {

            photos.push(req.param('photo4'));

        }

        Media.create({
            photos: photos
        }, function (err, media) {

            if (err) throw err;

            Destination.create({
                title: {
                    cn: req.param('title')
                },
                introduction: req.param('introduction'),
                description: req.param('description'),
                address: req.param('address'),
                phone: req.param('phone'),
                website: req.param('website'),
                minutes: req.param('minutes'),
                media_id: media.id,
                owner: req.user.id,
                is_hidden: true
            }, function (err, destination) {

                User.findOne({_id: req.user.id}).exec(function (err, user) {

                    user.posts.push(destination.id);

                    utils.newNotification(user.notifications, '你的新地方正在等待批准：' + req.param('title'), '/destination/manage', 'thank');

                    user.save(function (error) {

                        if (error) {

                            throw error;

                        }

                        return res.redirect('/destination/manage');

                    });

                });

            });

        });

    });

    router.get('/destination/edit/:id', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).populate('posts').exec(function (err, user) {
            User.populate(user, {
                path: 'posts.media_id',
                model: 'Media'
            }, function (err, result) {

                return res.render('content/editdestination', {
                    destination: result.posts.filter(function (post) {
                        return post.id == req.param('id')
                    })[0],
                    action: '/destination/edit'
                });

            });

        });


    });

    router.get('/destination/edit', utils.isAuthenticated, function (req, res) {
        return res.redirect('/destination/manage');
    });

    router.post('/destination/edit', utils.isAuthenticated, function (req, res) {

        var photos = [];

        if (req.param('photo1').length) {

            photos.push(req.param('photo1'));

        }

        if (req.param('photo2').length) {

            photos.push(req.param('photo2'));

        }

        if (req.param('photo3').length) {

            photos.push(req.param('photo3'));

        }

        if (req.param('photo4').length) {

            photos.push(req.param('photo4'));

        }

        User.findOne({_id: req.user.id})
            .populate('posts')
            .exec(function (err, user) {

                User.populate(user, {
                    path: 'posts.media_id',
                    model: 'Media'
                }, function (err, result) {

                    user.posts.forEach(function (post, i) {

                        if (post.id == req.param('id')) {

                            user.posts[i].title['cn'] = req.param('title');

                            user.posts[i].introduction = req.param('introduction');

                            user.posts[i].description = req.param('description');

                            user.posts[i].address = req.param('address');

                            user.posts[i].phone = req.param('phone');

                            user.posts[i].website = req.param('website');

                            user.posts[i].minutes = req.param('minutes');

                            user.posts[i].media_id.photos = photos;

                            user.posts[i].save(function (error) {

                                if (error) {

                                    throw error;

                                }

                                user.posts[i].media_id.save(function (error) {

                                    if (error) {

                                        throw error;

                                    }

                                    return res.redirect('/destination/manage');

                                });

                            });

                        }

                    });

                });

            });

    });

    router.post('/destination/delete', utils.isAuthenticated, function (req, res) {

        var id = req.param('id');

        User.findOne({_id: req.user.id}).populate('posts').exec(function (err, user) {

            user.posts.forEach(function (post, i) {

                if (post.id == id) {


                    user.posts[i].remove(function (error) {

                        if (error) {

                            throw error;

                        }

                        user.posts.splice(i, 1);

                        user.save(function (error) {

                            if (error) {

                                throw error;

                            }

                            return res.redirect('/destination/manage');

                        });

                    });

                }

            });

        });

    });

    return router;

};