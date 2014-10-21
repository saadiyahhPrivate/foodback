var express = require('express');
var router = express.Router();

var utils = require('../utils/utils')
var models = require('../data/models');
var User = models.User,
    Review = models.Review,
    Scope = models.Scope;

var post = require('./post/index');
var vote = require('./vote/index');
var remove = require('./delete/index'); //using delete throws an error (keyword)

router.use('/post', post);
router.use('/vote', vote);
router.use('/delete', remove);

// GET /reviews
// Request query:
//     - (OPTIONAL) tags: a comma-separated list of tags to search for
// Response:
//     - success: true if the search finished without error
//     - content: on success, an array containing the review objects that
//                matched the search
//     - err: on failure, an error message
router.get('/', function(req, res) {
    var tags;

    var query = {};
    if (req.query.tags) {
        tags = req.query.tags.split(',');
        query.tags = {$in: tags};
    }
    Review.find({}).populate('author', '_id').exec(function (err, reviews) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Unknown error.');
        } else {
        	utils.sendSuccessResponse(res, reviews);
        }
    });
});

// GET /reviews/:dininghall
// Request parameters:
//     - dininghall: the name of the dining hall for which to find reviews
// Request query:
//     - (OPTIONAL) tags: a comma-separated list of tags to search for
// Response:
//     - success: true if the search finished without error
//     - content: on success, an array containing the review objects that
//                matched the search
//     - err: on failure, an error message
router.get('/:dininghall', function(req, res) {
    var hall = req.params.dininghall,
        tags;

    Scope.find({hall: hall}, '_id', function (err, scopes) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Unknown error.');
        } else if (scopes) {
            console.log('Just hall 1');
            var ids = scopes.map(function (val, i, arr) {
                return val._id;
            });
            var query = {scope: {$in: ids}};
            if (req.query.tags) {
                tags = req.query.tags.split(',');
                query.tags = {$in: tags};
            }
            Review.find(query).populate('author', '_id').exec(function (err, reviews) {
                if (err) {
                    utils.sendErrResponse(res, 500, 'Unknown error.');
                } else {
                	utils.sendSuccessResponse(res, reviews);
                }
            });
        } else {
            console.log('Just hall 2');
            utils.sendSuccessResponse(res, []);
        }
    });
});

// GET /reviews/:dininghall/:mealperiod
// Request parameters:
//     - dininghall: the name of the dining hall for which to find reviews
//     - mealperiod: the name of the meal period for which to find reviews
// Request query:
//     - (OPTIONAL) tags: a comma-separated list of tags to search for
// Response:
//     - success: true if the search finished without error
//     - content: on success, an array containing the review objects that
//                matched the search
//     - err: on failure, an error message
router.get('/:dininghall/:mealperiod', function(req, res) {
    var hall = req.params.dininghall,
        period = req.params.mealperiod,
        tags;

    Scope.findOne({hall: hall, period: period}, '_id', function (err, scope) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Unknown error.');
        } else if (scope) {
            console.log('Hall & period 1');
            var query = {scope: scope._id};
            if (req.query.tags) {
                tags = req.query.tags.split(',');
                query.tags = {$in: tags};
            }
            Review.find(query).populate('author', '_id').exec(function (err, reviews) {
                if (err) {
                    utils.sendErrResponse(res, 500, 'Unknown error.');
                } else {
                	utils.sendSuccessResponse(res, reviews);
                }
            });
        } else {
            console.log('Hall & period 2');
            utils.sendSuccessResponse(res, []);
        }
    });
});

module.exports = router;
