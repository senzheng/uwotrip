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

    router.get('/myplaces', utils.isAuthenticated, function (req, res) {

        User.populate(req.user, {path: 'myplaces', model: 'Destination'}, function (error, user) {

            User.populate(user, {path: 'myplaces.media_id', model: 'Media'}, function (error, user) {

                Order.find({operator: user.id}).exec(function (error, orders) {

                    return res.render('content/order/myplaces', {destinations: user.myplaces, orders: orders});

                });

            });

        });

    });

    router.post('/order/new', utils.isAuthenticated, function (req, res) {

        var destinations = JSON.parse(req.body.data).destinations;

        if (!destinations) {

            return res.redirect('/myplaces');

        }

        var generatePin = function (orders) {
            var min = 0,
                max = 9999;

            var result = ("0" + (Math.floor(Math.random() * (max - min + 1)) + min)).substr(-4);

            var existingPins = [];

            orders.forEach(function (o, i) {
                existingPins.push(o.pin);
            });

            if (!existingPins.indexOf(result)) {
                generatePin(orders);
            } else {
                return result;
            }
        };

        Order.find({completed: {$ne: true}}).select('pin').exec(function (error, orders) {

            var newPin = generatePin(orders);

            var newOrder = {
                destinations: [],
                operator: req.user.id,
                pin: newPin
            };

            User.populate(req.user, {
                path: 'myplaces',
                model: 'Destination'
            }, function (err, user) {

                destinations.forEach(function (element, index, array) {

                    var destination = user.myplaces.filter(function (value) {

                        return value.id == element;

                    })[0];

                    newOrder.destinations.push(destination.id);

                });

                Order.create(newOrder, function (error, order) {
                    if (error) throw error;

                    return res.redirect('/trip/request/' + order.id);
                });

            });
        });

    });

    router.post('/trip/edit', utils.isAuthenticated, function (req, res) {

        var hotels = req.param('hotels'),
            lunches = req.param('lunches'),
            dinners = req.param('dinners');

        Order.findOne({_id: req.param('id')}).exec(function (error, order) {

            order.name = req.param('trip_name');
            order.official_guides_count = req.param('official_guides_count');
            order.official_guides = req.param('offical_guides');
            order.hotel_level = req.param('hotel_level');
            order.vehicle_type = req.param('vehicle_type');
            order.additional_costs = req.param('additional_costs');
            order.total = req.param('total');

            var startFromHotel = false;

            order.trip.forEach(function (day, i) {
                day.forEach(function (waypoint, j) {
                    if (waypoint.type == 'start' && startFromHotel) {
                        waypoint.address = hotels[i - 1];
                        startFromHotel = false;
                    }

                    if (day[j - 1].type == 'waypoint') {

                    }

                    if (waypoint.type == 'end' && hotels[i]) {
                        // If previous waypoint is not a dinner, calculate distance
                        if (day[j - 1] && day[j - 1].type != 'dinner') {
                            var previousWaypoint = day[j - 1].address;
                            var currentWaypoint = day[j].address;

                            var duration = utils.getDistanceSync(previousWaypoint, currentWaypoint);

                            var previousEndTime = new Date(day[j - 1].end_time);
                            var currentStartTime = new Date(previousEndTime);
                            currentStartTime.setMinutes(currentStartTime.getMinutes() + duration);

                            day[j].duration = duration;
                            day[j].start_time = new Date(currentStartTime);
                            currentStartTime.setMinutes(currentStartTime.getMinutes() + day[j].minutes);
                            waypoint.end_time = new Date(currentStartTime);
                        }

                        waypoint.address = hotels[i];
                        startFromHotel = true;
                    }

                    if (waypoint.type == 'lunch' && lunches[i]) {
                        waypoint.address = lunches[i];
                    }

                    if (waypoint.type == 'dinner' && dinners[i]) {
                        waypoint.address = dinners[i];
                    }
                });
            });

            order.save(function () {
                return res.json({
                    success: true
                });
            });

        });

    });

    router.get('/trip/edit/:id', utils.isAuthenticated, function (req, res) {

        var id = req.param('id');

        Order.findOne({_id: id}).exec(function (error, order) {

            User.populate(req.user, {path: 'employees', model: 'User'}, function (error, user) {

                var localGuideCost = order.destinations.length * 180;

                return res.render('content/order/booking', {id: id, order: order, user: user, localGuidesCost: localGuideCost});

            });

        });

    });

    router.get('/trip/request/:id', utils.isAuthenticated, function (req, res) {

        var id = req.param('id');

        Order.findOne({_id: id}).exec(function (error, order) {

            var estimatedCost = order.destinations.length * 180;

            return res.render('content/order/checkout', {id: id, order: order, estimated_cost: estimatedCost});

        });

    });


    router.post('/trip/request', function (req, res) {

        Order.findOne({_id: req.body.id}).exec(function (error, order) {
            utils.sendToGenerate({
                id: req.body.id,
                trip_name: req.body.trip_name,
                start_time: new Date(req.body.start_time),
                start_address: req.body.start_address,
                end_address: req.body.end_address,
                people: req.body.people,
                official_guides_count: req.body.official_guides_count,
                official_guides: req.body.official_guides,
                hotel_level: req.body.hotel_level,
                vehicle_type: req.body.vehicle_type
            });

            return res.json({
                success: true
            });
        });

    });

    /*
     Input: id, pin
     Output: success: true/false
     Summary: If pin matches an order they will join order.members.
     Note: Use order.members to select which orders show in a respective member's portal.
     */
    router.post('/order/jointrip', function (req, res) {

        Order.findOne({completed: {$ne: true}, pin: req.body.pin}).exec(function (error, order) {

            if (!order) {
                return res.json({success: false});
            }

            if (order.members.indexOf(req.body.id) == -1) {
                order.members.push(req.body.id);
            }

            order.save(function () {
                return res.json({success: true});
            });
        });

    });

    router.get('/g2/order', function(req, res){
        return res.render('content/ejs/orderg.ejs');
    })

    return router;
};