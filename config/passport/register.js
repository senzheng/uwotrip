var LocalStrategy = require('passport-local').Strategy;
var User = require('../../models/User');
var Media = require('../../models/Media');
var bCrypt = require('bcrypt-nodejs');

module.exports = function (passport) {

    passport.use('registerGuide', new LocalStrategy({
            passReqToCallback: true
        },
        function (req, username, password, done) {
            function findOrCreateUser() {
                var query = {
                    $or: [
                        {'username': username}, {'email': req.param('alipay')}
                    ]
                };
                User.findOne(query, function (err, user) {

                    if (err || user) {

                        req.flash('registerMessage', '用户已存在。');

                        return req.res.redirect('/#register');

                    }

                    var newUser = new User();

                    newUser.username = username;

                    newUser.password = createHash(password);

                    newUser.email = req.param('alipay');

                    newUser.first_name = req.param('firstname');

                    newUser.last_name = req.param('lastname');

                    newUser.wechat = req.param('wechat');

                    newUser.qq = req.param('qq');

                    newUser.phone = req.param('phone');

                    newUser.is_guide = true;

                    newUser.waiting_approval = true;

                    Media.create({
                        photos: []
                    }, function (err, media) {

                        newUser.media_id = media.id;

                        newUser.save(function (err) {

                            if (err) {

                                throw err;

                            }

                            return done(null, newUser);

                        });

                    });

                });

            };

            process.nextTick(findOrCreateUser);
        })
    );
}

var isValidPassword = function (user, password) {
    return bCrypt.compareSync(password, user.password);
}

// Generates hash using bCrypt
var createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}