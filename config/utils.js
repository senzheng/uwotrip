var shortid = require('shortid');

var bCrypt = require('bcrypt-nodejs');

var nodemailer = require('nodemailer');

var request = require('request-json');

var sreq = require('sync-request');

var transporter = nodemailer.createTransport('smtps://coedry@gmail.com:grantdawsoN1@smtp.gmail.com');

var distance = require('google-distance');
distance.apiKey = 'AIzaSyAY4SM1zC4cNQZlrH9VWyp5s2zUXmkyrlc';//'AIzaSyA_H2hkrquk3xFwmwKR6LzsKsyIBEYkFNU';//'AIzaSyD_Bnw97lQPE0mKtQ0mqYC4jwhAK22iDwA';//'AIzaSyAY4SM1zC4cNQZlrH9VWyp5s2zUXmkyrlc';

var stripe = require('stripe')('sk_test_cAefVlVMmXfcSKMZOKLhielX');

var map = request.createClient('https://maps.googleapis.com/');

var sync = require('synchronize');

var sleep = require('sleep');

var amqp = require('amqplib/callback_api');

var generateQueue = 'generate';
var channel;

amqp.connect('amqp://localhost', function(err, conn) {
    conn.createChannel(function(err, ch) {
        ch.assertQueue(generateQueue, {durable: false});
        channel = ch;
    });
});

var User = require('../models/User');
var Media = require('../models/Media');
var Destination = require('../models/Destination');

module.exports = {
    sendToGenerate: function (input) {
        channel.sendToQueue(generateQueue, new Buffer(JSON.stringify(input)));
        console.log(" [x] Sent");
    },
    getDistanceSync: function (start, address) {

        var that = this;

        var url = 'maps/api/distancematrix/json?departure_time=now&origins=' + that.escapeString(start) + '&destinations=' + that.escapeString(address) + '&mode=driving&traffic_model=pessimistic&key=' + distance.apiKey;

        var res = sreq('GET', 'https://maps.googleapis.com/' + url);

        var body = JSON.parse(res.getBody()).rows[0].elements[0];

        return body.duration.value / 60;
    },
    isAdmin: function (req, res, next) {
        if (req.user.is_admin) {

            return next();

        } else {

            return res.redirect('/orders');

        }
    },
    isAuthenticated: function (req, res, next) {

        if (req.isAuthenticated()) {

            if (req.user.has_agreed) {

                return next();

            } else {

                req.session.return = req.path;

                return res.redirect('/agree');

            }

        } else {

            return res.redirect('/?r=' + req.path + '#login');

        }
    },
    getDistanceMatrix: function (addresses) {

        var that = this;

        var start = addresses[0];

        var distanceMatrix = [];

        addresses.forEach(function (address, i) {

            distanceMatrix.push(that.getDistanceSync(start, address));

        });

        return distanceMatrix;

    },

    /*getDistanceMatrix: function (addresses, cb) {
     var that = this;

     var distanceMatrix = [];

     var counter = 0;

     addresses.forEach(function (address, i) {
     var distances = [];

     var index = 0;


     console.log('went: ');

     addresses.forEach(function (subaddress, j) {

     var url = 'maps/api/distancematrix/json?departure_time=now&origins=' + that.escapeString(address) + '&destinations=' + that.escapeString(addresses[index++]) + '&mode=driving&traffic_model=pessimistic&key=' + distance.apiKey;

     var res = srequest('https://maps.googleapis.com/' + url, {method: 'GET'});

     var body = JSON.parse(res.body);

     console.log(body);
     distances.push(body.rows[0].elements[0]);

     counter++;

     if (counter % addresses.length == 0) {
     distanceMatrix.push(distances);
     }

     console.log('Counter: ' + counter + ', Length: ' + addresses.length);

     if (counter >= (addresses.length * addresses.length)) {
     cb(null, distanceMatrix);
     }
     });

     map.get(url, function (err, res, body) {
     console.log(body);
     distances.push(body.rows[0].elements[0]);

     counter++;

     if (counter % addresses.length == 0) {
     distanceMatrix.push(distances);
     }

     if (counter >= (addresses.length * addresses.length)) {
     cb(null, distanceMatrix);
     }
     });

     addresses.forEach(function (subaddress, j) {


     console.log('went: ' + j);

     var url = 'maps/api/distancematrix/json?departure_time=now&origins=' + that.escapeString(address) + '&destinations=' + that.escapeString(subaddress) + '&mode=driving&traffic_model=pessimistic&key=' + distance.apiKey;


     map.get(url, function (err, res, body) {
     console.log(body);
     distances.push(body.rows[0].elements[0]);

     counter++;

     if (counter % addresses.length == 0) {
     distanceMatrix.push(distances);
     }

     if (counter >= (addresses.length * addresses.length)) {
     cb(null, distanceMatrix);
     }
     });


     });
     });
     },*/
    /*getDistanceMatrix: function (addresses, cb) {
     var waypoints = addresses.join('|');

     var url = 'maps/api/distancematrix/json?departure_time=now&origins=' + this.escapeString(waypoints) + '&destinations=' + this.escapeString(waypoints) + '&mode=driving&traffic_model=pessimistic&key=' + distance.apiKey;

     map.get(url, function (err, res, body) {
     cb(null, body);
     });
     },*/
    /*getDistanceMatrix: function (addresses, cb) {
     var waypoints = addresses.join('|');

     var that = this;

     addresses.forEach(function (address, i) {
     var url = 'maps/api/distancematrix/json?departure_time=now&origins=' + that.escapeString(address) + '&destinations=' + that.escapeString(waypoints) + '&mode=driving&traffic_model=pessimistic&key=' + distance.apiKey;

     map.get(url, function (err, res, body) {
     console.log(body);
     });
     });

     cb(null, null);


     },*/
    searchChunk: function (req, res, cb) {
        var limit = 20;

        req.body.p = req.body.p || 1;

        var skip = (req.body.p - 1) * limit;

        req.body.m = req.body.m || 'destination';

        req.body.k = req.body.k || '';

        req.body.c = req.body.c || '';

        if (typeof req.body.k != 'string') {

            throw new Error();

        }

        var keywords = [];

        req.body.k.split(' ').forEach(
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
                'title.en': {
                    $in: keywords
                }
            }, {
                'title.cn': {
                    $in: keywords
                }
            }, {
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

        if (req.body.c) {

            query.tags = req.query.c;

        }

        if (req.body.m == 'guide') {

            query.is_guide = true;

            query.waiting_approval = {$ne: true};

            User.find(query).limit(limit).skip(skip).populate('media_id').exec(function (error, result) {

                User.count(query, function (error, count) {

                    cb({
                        mode: req.body.m,
                        page: req.body.p,
                        max: Math.ceil(count / limit),
                        keywords: req.body.k,
                        category: req.body.c,
                        results: result
                    });

                });

            });

        } else {

            query.media_id = {$ne: null};

            query.address = {$ne: null};

            query.is_hidden = {$ne: true};

            Destination.find(query).limit(limit).skip(skip).populate('media_id').exec(function (error, result) {

                Destination.count(query, function (error, count) {

                    cb({
                        mode: req.body.m,
                        page: req.body.p,
                        max: Math.ceil(count / limit),
                        keywords: req.body.k,
                        category: req.body.c,
                        results: result
                    });

                });

            });

        }
    },
    sync: sync,
    getShortestRoute: function (start_point, end_point, destinations, cb) {
        var addresses = [];

        destinations.forEach(function (destination, i) {

            addresses.push(destination.address);

        });

        var waypoints = addresses.join('|');

        var url = 'maps/api/directions/json?origin=' + start_point + '&destination=' + end_point + '&waypoints=optimize:true|' + waypoints;

        map.get(url, function (err, res, body) {
            cb(body);
        });
    },
    escapeString: function (str) {
        return encodeURIComponent(str);
    },
    getParameterByName: function (name, url) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
            results = regex.exec(url);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    },
    getShortId: function () {
        return shortid;
    },
    addOrdersMinutes: function (orders) {
        orders.forEach(function (order, i) {

            var orderMinutes = 0;

            order.trips.forEach(function (trip, j) {

                var tripMinutes = 0;

                var people = 0;

                var count = 0;

                trip.days.forEach(function (day, k) {

                    day.forEach(function (waypoint, l) {

                        trip.destinations.forEach(function (destination, m) {

                            if (destination.destination_id && waypoint.destination_id == destination._id) {

                                count++;

                                tripMinutes += destination.minutes;

                                people += destination.people;

                            }

                        });

                    });

                });

                orders[i].trips[j].people = parseInt(people / count);

                orders[i].trips[j].minutes = tripMinutes;

                orders[i].trips[j].estimate = (tripMinutes * 2).toFixed(2);

                orderMinutes += tripMinutes;

            });

            orders[i].trips.total = orderMinutes;

            orders[i].minutes = orderMinutes;

            orders[i].estimate = ((orderMinutes * 2) - orders[i].paid / 100.0).toFixed(2);
        });
    },
    addMinutes: function (user, forCart) {
        var total = 0;

        user.mytrips.forEach(function (trip, index) {
            var minutes = 0;
            var people = 0;
            var count = 0;
            trip.days.forEach(function (day, j) {
                day.forEach(function (waypoint, k) {
                    trip.destinations.forEach(function (destination) {
                        if (destination.destination_id && waypoint == destination.id) {
                            count++;
                            minutes += destination.minutes;
                            people += destination.people;
                        }
                    });
                });
            });

            if (forCart) {
                if (trip.carted && !trip.checked_out) {
                    total += minutes;
                }
            } else {
                if (!trip.carted) {
                    total += minutes;
                }
            }

            user.mytrips[index].people = parseInt(people / count);
            user.mytrips[index].minutes = minutes;
            user.mytrips[index].estimate = (minutes * 2).toFixed(2);
        });
        user.mytrips.total = total;
    },
    getDistance: function () {
        return distance;
    },
    getStripe: function () {
        return stripe;
    },
    sendForgotPasswordMail: function (email, password) {
        var mailOptions = {
            from: 'Uwo Trip <coedry@email.com>', // sender address
            to: email, // list of receivers
            subject: 'Forgot Password - Uwo Trip ✔', // Subject line
            text: 'Your new temporary password is: ' + password, // plaintext body
            html: '<b>Your new temporary password is: </b>' + password // html body
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                return console.log(error);
            }

            console.log('Message sent: ' + info.response);
        });
    },
    createHash: function (password) {
        return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
    },
    newNotification: function (notifications, content, url, type) {
        notifications.push({
            type: type || 'default',
            content: content || '',
            url: url || '',
            read: false
        });
    },
    isValidPassword: function (user, password) {
        return bCrypt.compareSync(password, user.password);
    }
}