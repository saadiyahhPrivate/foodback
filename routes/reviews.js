// Review search feature
// author: Abdi

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

function getReviewHandle(query) {
    return Review.find(query).populate('author', '-password').populate('scope', 'hall period -_id');
}

function attachTags(req, query) {
    if (req.query.tags) {
        var tags = req.query.tags.trim().split(/\s*,\s*/);
        query.tags = {$in: tags};
    }
}

function parseReviews(req, reviews) {
    if (req.session.username) {
        var username = req.session.username,
            i;
        for (i = 0; i < reviews.length; i++) {
            var review = reviews[i];
            review.canDelete = review.author._id === username ? true : false;
            review.canVote = review.voters.indexOf(username) === -1 ? true: false;
            delete review.author._id;
            delete review.voters;
        }
    } else {
        var i;
        for (i = 0; i < reviews.length; i++) {
            var review = reviews[i];
            review.canDelete = false;
            review.canVote = false;
            delete review.author._id;
            delete review.voters;
        }
    }
}

// GET /reviews
// Request query:
//     - (OPTIONAL) tags: a comma-separated list of tags to search for
// Response:
//     - success: true if the search finished without error
//     - content: on success, an array containing the review objects that
//                matched the search
//     - err: on failure, an error message
router.get('/', function(req, res) {
    var query = {};
    attachTags(req, query);

    var handle = getReviewHandle(query);
    handle.exec(function (err, reviews) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Unknown error.');
        } else {
            parseReviews(req, reviews);
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
    var hall = req.params.dininghall;

    Scope.find({hall: hall}, '_id', function (err, scopes) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Unknown error.');
        } else if (scopes) {
            var ids = scopes.map(function (val, i, arr) {
                return val._id;
            });
            var query = {scope: {$in: ids}};
            attachTags(req, query);

            var handle = getReviewHandle(query);
            handle.exec(function (err, reviews) {
                if (err) {
                    utils.sendErrResponse(res, 500, 'Unknown error.');
                } else {
                    parseReviews(req, reviews);
                    utils.sendSuccessResponse(res, reviews);
                }
            });
        } else {
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
        period = req.params.mealperiod;

    Scope.findOne({hall: hall, period: period}, '_id', function (err, scope) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Unknown error.');
        } else if (scope) {
            var query = {scope: scope._id};
            attachTags(req, query);

            var handle = getReviewHandle(query);
            handle.exec(function (err, reviews) {
                if (err) {
                    utils.sendErrResponse(res, 500, 'Unknown error.');
                } else {
                    parseReviews(req, reviews);
                    utils.sendSuccessResponse(res, reviews);
                }
            });
        } else {
            utils.sendSuccessResponse(res, []);
        }
    });
});

module.exports = router;
