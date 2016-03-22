var express = require('express');
var router = express.Router();
var utils = require('../config/utils');
var _ = require('lodash');
var twilio = require('twilio');

var User = require('../models/User');
var Message = require('../models/Message');

module.exports = function (io) {

    router.get('/phone', utils.isAuthenticated, function (req, res) {

        return res.render('content/phone');
    });

    io.sockets.on('connection', function (socket) {
        socket.on('join', function (result) {
            socket.join(result.id);
        });
    });

    router.get('/messages', utils.isAuthenticated, function (req, res) {

        Message.find({
            who: {
                $in: [req.user.id]
            }
        }).populate('who messages.sender').exec(function (err, messages) {

            return res.render('content/messages', {
                messages: messages
            });

        });
    });

    router.get('/messages/:id', utils.isAuthenticated, function (req, res) {

        var id = req.param('id');

        if (req.user.id == id) {
            return res.redirect('/messages');
        }

        Message.find({
            who: {
                $in: [req.user.id]
            }
        }).populate('who messages.sender').exec(function (err, messages) {

            var conversation;

            User.findOne({_id: id}).exec(function (err, user) {

                conversation = messages.filter(function (e) {

                    var match = false;

                    e.who.forEach(function (f) {

                        if (f.id == id) {

                            match = true;

                        }

                    });

                    return match;

                })[0];

                return res.render('content/messages', {
                    messages: messages,
                    conversation: conversation,
                    target: user
                });

            });

        });

    });

    router.post('/send', utils.isAuthenticated, function (req, res) {

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        var target = req.param('id');

        if (!target.length) {

            return res.end(JSON.stringify({
                success: false
            }));

        }

        var query = {};

        query.$and = [{who: {$in: [req.user.id]}}, {who: {$in: [target]}}];

        Message.findOne(query).exec(function (err, message) {

            var newMessage = {
                sender: req.user.id,
                message: req.param('message'),
                timestamp: new Date(Date.now()),
                target: target
            };

            if (!message) {

                message = new Message();

                message.who.push(req.user.id);

                message.who.push(target);

            }

            message.messages.push(newMessage);

            message.save(function (err) {

                if (err) {

                    throw err;

                }

                io.sockets.in(req.user.id).emit('new', newMessage);

                io.sockets.in(target).emit('new', newMessage);

                return res.end(JSON.stringify({
                    success: true
                }));

            });

        });

    });

    router.post('/messages/find', utils.isAuthenticated, function (req, res) {

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });

        var target = req.param('id');

        User.findOne({
            username: target
        }).exec(function (err, result) {

            var success = false;

            var message;

            if (result) {

                success = true;

            } else {
                message = '找不到用户。'
            }

            return res.end(JSON.stringify({
                success: success,
                id: result ? result.id : '',
                message: message
            }));

        });

    });

    router.get('/notifications', utils.isAuthenticated, function (req, res) {

        return res.render('content/notifications');

    });

    return router;

};