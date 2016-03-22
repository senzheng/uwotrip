var http = require('http');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var passport = require('passport');
var expressSession = require('express-session');
var socketio = require('socket.io');
var csrf = require('csurf');
var config = require('./config/config');
var mongoose = require('mongoose');


mongoose.connect(config.url);

var app = express();
var server = http.createServer(app);
var io = socketio.listen(server);

app.set('trust proxy', true);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.engine('ejs', require('ejs').renderFile);
app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('dev'));
app.use(flash());
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb'}));
app.use(cookieParser(config.secret));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({
    secret: config.secret,
    resave: true,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false
    }
}));

var initPassport = require('./config/passport/init');
initPassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
    res.locals.user = req.user;
    res.locals.path = req.path;
    next();
});

app.use(require('./routes/admin')());
app.use(require('./routes/cart')());
app.use(require('./routes/dashboard')());
app.use(require('./routes/common')());
app.use(require('./routes/realtime')(io));
app.use(require('./routes/user')(passport));
app.use(require('./routes/order')());

process.on('uncaughtException', function (error) {
    console.error(error.stack);
});

app.use(function(req, res) {
    res.status(404);
    return res.render('content/error', {
        error: {
            status: 404
        }
    });
});

app.use(function(error, req, res, next) {
    res.status(500);
    return res.render('content/error', {
        error: {
            status: 500
        }
    });
});

server.listen(process.env.PORT || 3000, function() {
    console.log('Express server listening on port ' + server.address().port);
});

module.exports = app;
