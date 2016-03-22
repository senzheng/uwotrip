var express = require('express');
var router = express.Router();
var utils = require('../config/utils');

var User = require('../models/User');
var Media = require('../models/Media');
var Destination = require('../models/Destination');
var Feedback = require('../models/Feedback');
var Pre = require('../models/preorder');
var Order = require('../models/Order');
var Review = require('../models/Review');

module.exports = function () {

    router.post('/getresults', function (req, res) {

        utils.searchChunk(req, res, function (data) {
            return res.render('partials/chunkresults', data);
        });



    });



//sen start:

router.get('/orderss', function(req, res){
    
          Order.find({}, {},function (err, data){
             for(var i = 0; i < data.length; i++){
                //console.log(data[i].trips);
                var newPreview = new Pre();

                newPreview.operator = data[i].operator;
                newPreview.official_guides = data[i].official_guides;
                newPreview.tourists = data[i].tourists;
                newPreview.tour_operator = data[i].tour_operator;
                newPreview._id = data[i]._id;
                newPreview.trip_name = data[i].name;
                newPreview.order_status = data[i].order_status;
                newPreview.payment_status = data[i].payment_status;
                newPreview.paid = data[i].paid;
                
                if(data[i].dispute != null || data[i].dispute != undefined){
                    newPreview.status = 5;
                }else if(data[i].cancel == true){
                    newPreview.status = 4;
                }else if(data[i].completed == true){
                    newPreview.status = 3;
                }else if(data[i].paid != undefined &&data[i].paid === data[i].total){
                    newPreview.status = 2;
                }else{
                    newPreview.status = 1;
                }




                newPreview.save(function (err){
                if(err) throw err;

                console.log("preOrder ceated!");
              });
             }

             res.end(JSON.stringify(data));
        })
});

router.get('/delete', function(req,res){
    Pre.remove({}, function(err){
        console.log("delete completed!");
    });
});



router.get('/guide/:id', function (req, res){
     User.find({"_id": req.params.id},{},function(err, data){
        console.log(data);
        return res.render('content/ejs/gv.ejs', {
            guide : data
        });
     });
     
});


/*
router.get('/getOrder', function(req, res){
       
            // if(user.type = ?) ===> go to different pages
            Pre.find({},{},function(err, data){
                console.log(data);
               return res.render('content/ejs/orderg.ejs', {
                  order : data
               });
            });
              

});
*/
router.get('/myOrder',utils.isAuthenticated ,function(req, res){
             //check the usertype

             if(req.user.user_type == 1){
                     Pre.find({"operator" : req.user._id},{},function(){
                        return res.render('content/ejs/orders.ejs', {
                              order : data,
                              user  : req.user
                        });
                   })
                 }else if (req.user.user_type == 2){
                       Pre.find({"tour_operator" : req.user._id},{},function(){
                        return res.render('content/ejs/orderop.ejs', {
                              order : data,
                               user  : req.user
                        });
                   })
                 }else if (req.user.user_type == 3 || req.user.user_type == 4){
                    Pre.find({"official_guides" : req.user._id},{},function(){
                        return res.render('content/ejs/orderg.ejs', {
                              order : data,
                              user  : req.user
                        });
                   })
                }else if(req.user.user_type == 5){
                    Pre.find({"tourists" : req.user._id},{},function(){
                        return res.render('content/ejs/orderg.ejs', {
                              order : data,
                               user  : req.user
                        });
                   });
                }else{  //fake>: if there is no user_type in the
                    Pre.find({"operator" : req.user._id}, {}, function(err, data){
                       return res.render('content/ejs/orderg.ejs', {
                              order : data,
                              user  : req.user
               });
      
             });
                }

                   
             

            
                
})


//get my reivew
router.get('/myreview', utils.isAuthenticated ,function(req, res){
           console.log(req.user.id);
        Review.find({"_id" : req.user.id},{}, function (err, review){
            res.render('content/ejs/reviews.ejs' , {
                reviews : review ,
                user    : req.user
            });
        });


})

//update the user's review 
router.post('/updateReview', function(req, res){
        console.log(req.body);
        Review.findById(req.body.id, function (err, review) {
           for(var i = 0; i < review.reviews.length; i++){
              console.log(review);
              if(req.body.trip_id == review.reviews[i].trip_id){
                  console.log(review.reviews[i]);
                  for(var j = 0; j < review.reviews[i].content.length; j++){
                    if(req.body.review_id == review.reviews[i].content[j]._id){
                        
                        if(req.body.rating != 0 && req.body.content != ""){
                            console.log(req.body.content);
                            review.reviews[i].content[j].rating = req.body.rating;
                            review.reviews[i].content[j].details = req.body.content;
                             review.reviews[i].content[j].time =  new Date();
                              review.reviews[i].content[j].status = 3;
                               review.save(function(err){
                                if(err) throw err;
                                console.log('reviews uploaded!');
                                
                            });
                        }else if(req.body.rating != 0 || req.body.content != ""){
                             //review.reviews[i].content[j].time =  new Date();
                              if(req.body.rating != 0){
                                review.reviews[i].content[j].rating = req.body.rating;
                              }

                              if(req.body.content != ""){
                               review.reviews[i].content[j].details = req.body.content;
                              }


                              review.reviews[i].content[j].status = 2;
                              
                              review.save(function(err){
                                if(err) throw err;
                                console.log('reviews uploaded!');
                            });
                        }
                          
                         

              
                        console.log(review.reviews[i].content[j]);

                        res.redirect('/getReviews/' + req.body.id)
                    }
                  }
              }
           }
        });
    });


//get the one user's review and rating
router.get('/userReview/:id', function(req, res){
       var review = [];
       var total = 0;

       Review.find({"reviews.content._id": req.params.id , "reviews.content.status" : 3},{"reviews.content" : 1}, function(err, data){
           console.log(data);
       })
});


//get the place's revie and rating
router.get('/placeReview/:id', function(req, res){
       var review = [];
       var total = 0;

       Review.find({"reviews.content._id": req.params.id , "reviews.content.status" : 3},{"reviews.content" : 1}, function(err, data){
           console.log(data);
       })
});

//get the place's total rating or average rating
router.get('/placerating/:id', function(req, res){
       var review = [];
       var total = 0;

       Review.find({"reviews.content._id": req.params.id , "reviews.content.status" : 3},{"reviews.content" : 1}, function(err, data){
           console.log(data);
       })
});
// sen ends:



    router.get('/listmap', function (req, res) {

        var limit = 12;

        req.query.p = req.query.p || 1;

        var skip = (req.query.p - 1) * limit;

        req.query.m = req.query.m || 'destination';

        req.query.k = req.query.k || '';

        req.query.c = req.query.c || '';

        if (typeof req.query.k != 'string') {

            return res.redirect('/search?m=' + req.query.m);

        }

        var keywords = [];

        req.query.k.split(' ').forEach(
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

        if (req.query.c) {

            query.tags = req.query.c;

        }

        if (req.query.m == 'guide') {

            query.is_guide = true;

            query.waiting_approval = {$ne: true};

            User.find(query).limit(limit).skip(skip).populate('media_id').exec(function (error, result) {

                User.count(query, function (error, count) {

                    return res.render('content/listmap', {
                        mode: req.query.m,
                        page: req.query.p,
                        max: Math.ceil(count / limit),
                        keywords: req.query.k,
                        category: req.query.c,
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

                    return res.render('content/listmap', {
                        mode: req.query.m,
                        page: req.query.p,
                        max: Math.ceil(count / limit),
                        keywords: req.query.k,
                        category: req.query.c,
                        results: result
                    });

                });

            });

        }

    });

    router.get('/', function (req, res) {

        return res.render('content/index', {
            loginMessage: req.flash('loginMessage'),
            registerMessage: req.flash('registerMessage')
        });

    });

    router.get('/destination/:id', function (req, res) {

        Destination.findOne({_id: req.param('id')}).populate('media_id owner').exec(function (error, result) {

            return res.render('content/destination', {
                destination: result
            });

        });

    });

    router.get('/guide/:id', function (req, res) {

        var query = {};

        query.is_guide = true;

        query._id = req.params['id'];

        User.findOne(query).populate('media_id').exec(function (error, result) {

            return res.render('content/guide', {
                guide: result
            });

        });

    });

    router.get('/about', function (req, res) {

        Destination.findOne({_id: req.param('id')}).populate('media_id').exec(function (error, result) {

            return res.render('content/about');

        });

    });

    router.post('/getresults', function (req, res) {
        

        utils.searchChunk(req, res, function (data) {
            console.log(data);
            req.session.mapdata = data;
            return res.render('partials/results', data);
        });



    });


    router.get('/faq', function (req, res) {

        return res.render('content/faq');

    });

    router.get('/contact', function (req, res) {

        return res.render('content/contact');

    });

    router.get('/disclaimer', function (req, res) {

        return res.render('content/disclaimer');

    });

    router.get('/feedback', function (req, res) {

        return res.render('content/feedback');

    });

    router.get('/guide/handbook', function (req, res) {

        return res.render('content/guidehandbook');

    });

    router.get('/operator/faq', function (req, res) {

        return res.render('content/operatorfaq');

    });

    router.get('/pricing', function (req, res) {

        return res.render('content/pricing');

    });

    router.get('/privacy', function (req, res) {

        return res.render('content/privacy');

    });


    router.get('/pricing', function (req, res) {

        return res.render('content/pricing');

    });

    router.post('/feedback', function (req, res) {
        res.writeHead(200, {'Content-Type': 'application/json'});

        Feedback.create({
            email: req.body.email,
            subject: req.body.subject,
            message: req.body.message
        }, function (err, feedback) {

            return res.end(JSON.stringify({
                success: true
            }));

        });

    });

    router.get('/search', function (req, res) {
        var limit = 12;

        req.query.p = req.query.p || 1;

        var skip = (req.query.p - 1) * limit;

        req.query.m = req.query.m || 'destination';

        req.query.k = req.query.k || '';

        req.query.c = req.query.c || '';

        if (typeof req.query.k != 'string') {

            return res.redirect('/search?m=' + req.query.m);

        }

        var keywords = [];

        req.query.k.split(' ').forEach(
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

        if (req.query.c) {

            query.tags = req.query.c;

        }

        if (req.query.m == 'guide') {

            query.is_guide = true;

            query.waiting_approval = {$ne: true};

            User.find(query).limit(limit).skip(skip).populate('media_id').exec(function (error, result) {

                User.count(query, function (error, count) {

                    return res.render('content/search', {
                        mode: req.query.m,
                        page: req.query.p,
                        max: Math.ceil(count / limit),
                        keywords: req.query.k,
                        category: req.query.c,
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

                    return res.render('content/search', {
                        mode: req.query.m,
                        page: req.query.p,
                        max: Math.ceil(count / limit),
                        keywords: req.query.k,
                        category: req.query.c,
                        results: result
                    });

                });

            });

        }

    });

    return router;

};