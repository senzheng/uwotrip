var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var utils = require('../config/utils');
var _ = require('lodash');

var User = require('../models/User');
var Media = require('../models/Media');
var Destination = require('../models/Destination');
var Order = require('../models/Order');

module.exports = function () {

    router.get('/checkout', utils.isAuthenticated, function (req, res) {

        return res.redirect('/cart');

    });

    router.post('/checkout', utils.isAuthenticated, function (req, res) {

        var stripeToken = req.body.token;

        var amount = req.body.amount;

        var total = req.body.total;

        var data = req.body.trips;

        if (stripeToken) {

            var charge = utils.getStripe().charges.create({
                amount: amount, // amount in cents
                source: stripeToken,
                description: 'Uwo Trip payment from: ' + req.user.email,
                currency: 'usd'
            }, function (err, charge) {

                res.writeHead(200, {'Content-Type': 'application/json'});

                if (err && err.type === 'StripeCardError') {

                    return res.end(JSON.stringify({
                        success: false
                    }));

                }

                if (charge) {

                    var order = [];

                    User.findOne({_id: req.user.id}).exec(function (error, result) {

                        result.mytrips.forEach(function (trip, i) {

                            data.forEach(function (item, j) {

                                if (item == trip.id) {

                                    trip.days.forEach(function (day, k) {

                                        day.forEach(function (waypoint, l) {

                                            result.mytrips[i].days[k][l] = {
                                                guide: null,
                                                destination_id: waypoint
                                            };

                                        });

                                    });

                                    order.push(trip);

                                    result.mytrips[i].checked_out = true;

                                }

                            });

                        });

                        Order.create({
                            operator: req.user.id,
                            paid: amount,
                            total: total,
                            charge_id: charge.id,
                            email: req.user.email,
                            trips: order
                        }, function (err, newOrder) {

                            if (err) throw err;

                            utils.newNotification(result.notifications, '谢谢您的付款：' + newOrder.id.toUpperCase(), '/order/' + newOrder.id, 'thank');

                            result.markModified('mytrips');

                            result.save(function (error) {

                                if (error) {

                                    throw error;

                                }

                                return res.end(JSON.stringify({
                                    success: true,
                                    order: newOrder.id
                                }));

                            });

                        });

                    });

                }

            });
        }

    });

    router.get('/mytrips/trip/:id', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).populate('mytrips.destinations.destination_id').exec(function (err, result) {

            var trip = result.mytrips.filter(function (trip) {
                return trip.id == req.params['id'];
            })[0];

            User.populate(trip, {
                path: 'destinations.destination_id.media_id',
                model: 'Media'
            }, function (err, result) {

                if (err || !result) {
                    return res.redirect('/mytrips');
                }

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

                            if (waypoint == destination.id) {

                                if (j == 0) {

                                    result.days[i][j] = {destination_id: waypoint};

                                } else {

                                    utils.getDistance().get({
                                            origin: previousAddress,
                                            destination: destination.address,
                                            language: 'zh-CN',
                                            units: 'imperial'
                                        },
                                        function (err, data) {

                                            result.days[i][j] = {
                                                travel: '旅程距离/时间: ' + data.distance + ', ' + data.duration,
                                                destination_id: waypoint
                                            };

                                            count++;

                                            if (count >= stopAt) {

                                                return res.render('content/tripdetails', {
                                                    trip: result,
                                                    back: req.header('Referer').indexOf('/cart') > -1 ? '/cart' : '/mytrips'
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

    router.get('/cart', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).exec(function (error, result) {

            utils.addMinutes(result, true);

            return res.render('content/cart', {
                trips: result.mytrips
            });

        });

    });

    /*
    router.get('/myplaces', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id})
            .populate('myplaces mytrips.destinations.destination_id')
            .exec(function (error, result) {

                User.populate(result, {path: 'myplaces.media_id', model: 'Media'}, function (err, user) {
                    // create a short description field from description field with max-length 150 and no html tag
                    for (var index in user.myplaces){
                        user.myplaces[index].description = user.myplaces[index].description || "";
                        user.myplaces[index].short_description = user.myplaces[index].description.replace(/(<([^>]+)>)/ig,"");
                    }

                    return res.render('content/myplaces', {destinations: user.myplaces, trips: user.mytrips});

                });

            });

    });
*/

    router.get('/myplaces/add', utils.isAuthenticated, function (req, res) {

        return res.redirect('/search?m=destination');

    });

    router.post('/myplaces/add', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id})
            .exec(function (error, result) {

                result.myplaces.push(req.body.id);

                result.save(function (error) {

                    if (error) {

                        throw error;

                    }

                    return res.json({
                        success: true,
                        message: '保存成功'
                    });

                });

            });

    });

    router.get('/myplaces/delete', utils.isAuthenticated, function (req, res) {

        return res.redirect('/myplaces');

    });

    router.post('/myplaces/delete', utils.isAuthenticated, function (req, res) {

        var destinations = JSON.parse(req.body.data).destinations;

        if (!destinations) {

            return res.redirect('/myplaces');

        }

        User.findOne({_id: req.user.id}).populate('myplaces').exec(function (error, result) {

            result.myplaces = _.filter(result.myplaces, function (destination) {

                var isMatch = true;

                destinations.forEach(function (element, i) {

                    if (element && destination.id == element) {

                        isMatch = false;

                        destinations.splice(i, 1);

                    }

                });

                return isMatch;

            });

            result.markModified('myplaces');

            result.save(function (error) {

                if (error) {

                    throw error;

                }

                return res.redirect('/myplaces');

            });

        });

    });

    router.get('/mytrips', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).exec(function (error, result) {

            utils.addMinutes(result);

            return res.render('content/mytrips', {
                trips: result.mytrips
            });

        });

    });

    router.get('/mytrips/new', utils.isAuthenticated, function (req, res) {

        return res.redirect('/myplaces');

    });

    router.post('/mytrips/new', utils.isAuthenticated, function (req, res) {

        var destinations = JSON.parse(req.body.data).destinations;

        if (!destinations) {

            return res.redirect('/myplaces');

        }

        User.findOne({_id: req.user.id}).populate('myplaces').exec(function (error, result) {

            var newTrip = {
                destinations: []
            };

            var trip_id;

            destinations.forEach(function (element, index, array) {

                var destination = result.myplaces.filter(function (value) {

                    return value.id == element;

                })[0];

                var newDestination = {
                    name: destination.title['cn'] || destination.title['en'],
                    minutes: destination.minutes,
                    address: destination.address,
                    destination_id: destination.id,
                    image: destination.photo ? destination.photo[0] : ''
                };

                newTrip.destinations.push(newDestination);

            });

            result.mytrips.push(newTrip);

            result.save(function (error) {

                if (error) {

                    throw error;

                }

                return res.redirect('/mytrips/generate/' + result.mytrips[result.mytrips.length - 1].id);

            });

        });

    });

    router.get('/mytrips/add', utils.isAuthenticated, function (req, res) {

        return res.redirect('/myplaces');

    });

    router.post('/mytrips/add', utils.isAuthenticated, function (req, res) {

        var destinations = JSON.parse(req.body.data).destinations;

        if (!req.body.trip || !destinations) {

            return res.redirect('/myplaces');

        }

        User.findOne({_id: req.user.id})
            .populate('myplaces')
            .exec(function (error, result) {

                var generated, carted;

                result.mytrips.forEach(function (element, index, array) {

                    if (req.body.trip == element.id) {

                        destinations.forEach(function (destination_id) {

                            var destination = result.myplaces.filter(function (value) {
                                return value.id == destination_id;
                            })[0];

                            var newDestination = {
                                name: destination.title['cn'] || destination.title['en'],
                                minutes: destination.minutes,
                                address: destination.address,
                                destination_id: destination.id,
                                image: destination.photo ? destination.photo[0] : ''
                            };

                            result.mytrips[index].destinations.push(newDestination);

                            generated = result.mytrips[index].generated;
                            carted = result.mytrips[index].carted;

                        });

                    }

                });

                result.save(function (error) {

                    if (error) {

                        throw error;
                    }

                    if (generated) {

                        if (carted) {
                            return res.redirect('/cart');
                        } else {
                            return res.redirect('/mytrips');
                        }

                    } else {

                        return res.redirect('/mytrips/generate/' + req.body.trip);

                    }

                });

            });

    });

    router.get('/mytrips/generate/:id', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).exec(function (error, result) {

            result.mytrips.forEach(function (element, index, array) {

                if (req.params['id'] == element.id) {

                    if (element.generated) {

                        return res.redirect('/mytrips');

                    } else {

                        return res.render('content/generate', {
                            trip_id: req.params['id']
                        });

                    }

                }

            });

        });

    });

    router.post('/mytrips/generate', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).populate('mytrips.destinations.destination_id').exec(function (error, result) {
            res.writeHead(200, {'Content-Type': 'application/json'});

            var trip;

            result.mytrips.forEach(function (element, index, array) {

                if (req.body.tid == element.id) {

                    trip = result.mytrips[index];

                    trip.name = req.body.trip_name;

                    trip.start_time = new Date(req.body.start_time);

                    trip.start_address = req.body.start_address;

                    trip.people = req.body.people;

                    trip.generated = true;

                }

            });

            var destinations = [];

            var minutes = 0;

            var homeDistance = {};

            var findClosest = function (t, d, newDay) {

                var closest = {distance: 1000000, index: 0};

                var count = 1;

                t.destinations.forEach(function (e, i) {

                    var query = {
                        origin: d.length && !newDay ? d[d.length - 1].address : t.start_address,
                        destination: e.address,
                        language: 'zh-CN',
                        units: 'imperial'
                    };

                    utils.getDistance().get(query,
                        function (err, data) {

                            if (err) {

                                return res.end(JSON.stringify({
                                    success: false,
                                    message: '请输入一个有效的起始地址。'
                                }));

                            }

                            homeDistance[(d.length && !newDay ? d[d.length - 1].address : t.start_address) + ',' + e.address] = data.durationValue;

                            if (closest.distance >= data.distanceValue) {

                                closest.distance = data.distanceValue;

                                closest.index = i;

                            }

                            if (count >= t.destinations.length) {

                                minutes += t.destinations[i].minutes;

                                if (minutes > 600) {

                                    minutes = 0;

                                    findClosest(t, d, true);

                                } else {

                                    d.push(t.destinations.splice(closest.index, 1)[0]);

                                    if (t.destinations.length) {

                                        findClosest(t, d);

                                    } else {

                                        t.days = [];

                                        var dayOfPlaces = [];

                                        minutes = 0;

                                        d.forEach(function (dest, j) {

                                            minutes += dest.minutes;

                                            var start_date;

                                            var end_date;

                                            if (minutes <= 600) {

                                                if (j == 0) {

                                                    start_date = new Date(trip.start_time);

                                                    t.destinations.push({
                                                        name: '会面点 ' + (t.days.length + 1),
                                                        minutes: 0,
                                                        address: t.start_address,
                                                        start_time: start_date,
                                                        end_time: start_date,
                                                        destination_id: null,
                                                        people: trip.people,
                                                        id: mongoose.Types.ObjectId()
                                                    });

                                                    start_date.setMinutes(start_date.getMinutes() + (homeDistance[trip.start_address + ',' + dest.address] / 60));

                                                    end_date = new Date(start_date);

                                                    end_date.setMinutes(end_date.getMinutes() + d[j].minutes);

                                                    dayOfPlaces.push(t.destinations[t.destinations.length - 1].id);

                                                } else {

                                                    start_date = new Date(d[j - 1].end_time);

                                                    start_date.setMinutes(start_date.getMinutes() + (homeDistance[d[j - 1].address + ',' + dest.address] / 60));

                                                    end_date = new Date(start_date);

                                                    end_date.setMinutes(start_date.getMinutes() + d[j].minutes);

                                                }

                                                dayOfPlaces.push(dest.id);

                                            } else {

                                                t.days.push(dayOfPlaces);

                                                minutes = dest.minutes;

                                                var originalStart = new Date(trip.start_time);

                                                start_date = new Date(d[j - 1].end_time);

                                                start_date.setTime(originalStart.getTime());

                                                start_date.setDate(start_date.getDate() + 1);

                                                dayOfPlaces = [];

                                                t.destinations.push({
                                                    name: '会面点 ' + (t.days.length + 1),
                                                    minutes: 0,
                                                    address: t.start_address,
                                                    start_time: start_date,
                                                    end_time: start_date,
                                                    destination_id: null,
                                                    people: trip.people,
                                                    id: mongoose.Types.ObjectId()
                                                });

                                                start_date.setMinutes(start_date.getMinutes() + (homeDistance[trip.start_address + ',' + dest.address] / 60));

                                                end_date = new Date(start_date);

                                                end_date.setMinutes(start_date.getMinutes() + d[j].minutes);

                                                dayOfPlaces.push(t.destinations[t.destinations.length - 1].id);

                                                dayOfPlaces.push(dest.id);

                                            }

                                            d[j].start_time = start_date;

                                            d[j].end_time = end_date;

                                            d[j].people = trip.people;

                                            t.destinations.push(dest);

                                            if (j >= (d.length - 1)) {

                                                t.days.push(dayOfPlaces);

                                            }

                                        });

                                        result.markModified('mytrips');

                                        result.save(function (error) {

                                            if (error) {

                                                throw error;

                                            }

                                            return res.end(JSON.stringify({
                                                success: true,
                                                trip: t,
                                                message: '生成的旅行圆满成功。'
                                            }));

                                        });

                                    }

                                }

                            }

                            count++;

                        }
                    );

                });

            };

            findClosest(trip, destinations);

        });

    });

    router.get('/mytrips/delete/:id', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).exec(function (error, result) {

            result.mytrips.forEach(function (element, index) {

                if (req.params['id'] == element.id) {

                    result.mytrips.splice(index, 1);

                }

            });

            var goBack = utils.getParameterByName('r', req.url);

            result.save(function (error) {

                if (error) {

                    throw error;

                }

                return res.redirect(goBack);

            });

        });

    });

    router.get('/trip/:id', utils.isAuthenticated, function (req, res) {

        return res.render('content/tripdetails');

    });

    router.get('/plan/:id', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).populate('mytrips.destinations.destination_id').exec(function (error, result) {

            result.mytrips.forEach(function (element) {

                if (element.id == req.params['id']) {

                    if (element.checked_out) {

                        return res.redirect('/orders');

                    } else {

                        return res.render('content/plantrip', {trip: element});

                    }

                }

            });

        });

    });

    router.get('/confirm', utils.isAuthenticated, function (req, res) {

        return res.render('content/confirmcheckout', {
            order: req.query.o,
            success: req.query.s
        });

    });

    router.post('/plan/trip/save', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).exec(function (error, result) {

            res.writeHead(200, {'Content-Type': 'application/json'});

            var success = true;

            var message = '计划保存成功。';

            result.mytrips.forEach(function (trip, i) {

                if (trip.id == req.body.tid) {

                    req.body.days.forEach(function (day, i) {

                        var minutes = 0;

                        day.forEach(function (waypoint) {

                            trip.destinations.forEach(function (destination) {

                                if (waypoint == destination.id) {

                                    minutes += destination.minutes;

                                }

                                if (minutes > 600) {

                                    success = false;

                                    message = '有' + (i + 1) + '天，包含超过10个小时。';

                                }
                            });

                        });
                    });

                    if (success) {

                        result.mytrips[i].days = req.body.days;

                        result.markModified('mytrips');

                        result.save(function (error) {

                            if (error) {

                                throw error;

                            }

                            return res.end(JSON.stringify({
                                success: success,
                                message: message
                            }));

                        });

                    } else {

                        return res.end(JSON.stringify({
                            success: success,
                            message: message
                        }));

                    }

                }

            });

        });

    });

    router.post('/plan/destination/save', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).exec(function (error, result) {
            res.writeHead(200, {'Content-Type': 'application/json'});

            var id = req.body.id;

            var index = 0;

            var updatedDestination;

            result.mytrips.forEach(function (element, i) {

                if (element.id == req.body.tid) {

                    var startTime = new Date(req.body.start_time);
                    var endTime = new Date(req.body.start_time);
                    endTime.setMinutes(startTime.getMinutes() + parseInt(req.body.minutes));

                    if (req.body.id) {

                        element.destinations.forEach(function (destination, j) {

                            if (destination.id == req.body.id) {

                                result.mytrips[i].destinations[j].name = req.body.name;

                                result.mytrips[i].destinations[j].minutes = req.body.minutes;

                                result.mytrips[i].destinations[j].address = req.body.address;

                                result.mytrips[i].destinations[j].people = req.body.people;

                                result.mytrips[i].destinations[j].start_time = startTime;

                                result.mytrips[i].destinations[j].end_time = endTime;

                                updatedDestination = result.mytrips[i].destinations[j];

                            }

                        });

                    } else {

                        index = i;

                        result.mytrips[i].destinations.push({
                            name: req.body.name,
                            minutes: req.body.minutes,
                            address: req.body.address,
                            people: req.body.people,
                            start_time: startTime,
                            end_time: endTime,
                            destination_id: null
                        });

                        updatedDestination = result.mytrips[i].destinations[result.mytrips[i].destinations.length - 1];

                    }

                    result.markModified('mytrips');

                    result.save(function (error) {

                        if (error) {

                            throw error;

                        }

                        return res.end(JSON.stringify({
                            success: true,
                            id: updatedDestination.id,
                            destination: updatedDestination
                        }));

                    });

                }

            });

        });

    });

    router.post('/plan/destination/delete', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).exec(function (error, result) {

            var id = req.body.id;

            var index = 0;

            result.mytrips.forEach(function (element, i) {

                if (element.id == req.body.tid) {

                    element.destinations.forEach(function (destination, j) {

                        if (destination.id == req.body.id) {

                            result.mytrips[i].destinations.splice(j, 1);

                            result.markModified('mytrips');

                            result.save(function (error) {

                                if (error) {

                                    throw error;

                                }

                                res.writeHead(200, {"Content-Type": 'application/json'});

                                return res.end(JSON.stringify({
                                    success: true
                                }));

                            });

                        }

                    });

                }

            });

        });

    });

    router.post('/cart/add', utils.isAuthenticated, function (req, res) {

        User.findOne({_id: req.user.id}).exec(function (error, result) {

            result.mytrips.forEach(function (element, i) {

                if (element.id == req.body.tid) {

                    result.mytrips[i].carted = true;

                    result.markModified('mytrips');

                    result.save(function (error) {

                        if (error) {

                            throw error;

                        }

                        res.writeHead(200, {"Content-Type": 'application/json'});

                        return res.end(JSON.stringify({
                            success: true
                        }));

                    });

                }

            });

        });

    });

    return router;

};