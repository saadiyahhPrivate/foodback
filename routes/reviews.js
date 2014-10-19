var express = require('express');
var router = express.Router();

var utils = require('../utils/utils')
var models = require('../data/models');
var User = models.User,
    Review = models.Review,
    Scope = models.Scope;

var post = require('./post/index');
var vote = require('./vote/index');

router.use('/post', post);
router.use('/vote', vote);

router.get('/', function(req, res) {
    var tags;

    var query = {};
    if (req.query.tags) {
        tags = req.query.tags.split(',');
        query.tags = {$in: tags};
    }
    Review.find({}, function (err, reviews) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Unknown error.');
        }
        utils.sendSuccessResponse(res, reviews);
    });
});

router.get('/:dininghall', function(req, res) {
    var hall = req.params.dininghall,
        tags;

    Scope.find({hall: hall}, '_id', function (err, scopes) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Unknown error.');
        } else if (scopes) {
            var ids = scopes.map(function (val, i, arr) {
                return val._id;
            });
            var query = {scope: {$in: ids}};
            if (req.query.tags) {
                tags = req.query.tags.split(',');
                query.tags = {$in: tags};
            }
            Review.find(query, function (err, reviews) {
                if (err) {
                    utils.sendErrResponse(res, 500, 'Unknown error.');
                }
                utils.sendSuccessResponse(res, reviews);
            });
        } else {
            utils.sendSuccessResponse(res, []);
        }
    });
});

router.get('/:dininghall/:mealperiod', function(req, res) {
    var hall = req.params.dininghall,
        period = req.params.mealperiod,
        tags;

    Scope.findOne({hall: hall, period: period}, '_id', function (err, scope) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Unknown error.');
        } else if (scope) {
            var query = {scope: scope._id};
            if (req.query.tags) {
                tags = req.query.tags.split(',');
                query.tags = {$in: tags};
            }
            Review.find(query, function (err, reviews) {
                if (err) {
                    utils.sendErrResponse(res, 500, 'Unknown error.');
                }
                utils.sendSuccessResponse(res, reviews);
            });
        } else {
            utils.sendSuccessResponse(res, []);
        }
    });
});

module.exports = router;
