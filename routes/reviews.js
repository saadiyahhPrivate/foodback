// Review post/delete feature (author: Saadiyah)
// Review search feature (author: Abdi)

var express = require('express');
var router = express.Router();

var utils = require('../utils/utils')
var models = require('../data/models');
var User = models.User,
    Review = models.Review,
    Scope = models.Scope;

var vote = require('./vote/index');

router.use('/vote', vote);

function getReviewHandle(query) {
    return Review.find(query).populate('author', '-password').populate('scope', 'hall period -_id').sort('-score');
}

function attachTags(req, query) {
    if (req.query.tags) {
        var tags = req.query.tags.trim().split(/\s*,\s*/);
        query.tags = {$in: tags};
    }
}

function hallSearch(req, res, hall) {
    Scope.find({hall: hall}, function (err, scopes) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Unknown error.');
        } else if (scopes) {
            content = {score: 0, count: 0};
            for (var i = 0; i < scopes.length; i++) {
                content.score += scopes[i].numStars;
                content.count += scopes[i].totalReviews;
            }
            
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
                    reviews = parseReviews(req, reviews);
                    content.reviews = reviews;
                    utils.sendSuccessResponse(res, content);
                }
            });
        } else {
            utils.sendSuccessResponse(res, []);
        }
    });
}

function scopeSearch(req, res, hall, period) {
    Scope.findOne({hall: hall, period: period}, function (err, scope) {
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
                    reviews = parseReviews(req, reviews);
                    content = {};
                    content.reviews = reviews;
                    content.score = scope.numStars;
                    content.count = scope.totalReviews;
                    utils.sendSuccessResponse(res, content);
                }
            });
        } else {
            utils.sendSuccessResponse(res, []);
        }
    });
}

function parseReviews(req, reviews) {
    var output = [];
    if (req.session.username) {
        var username = req.session.username,
            i;
        for (i = 0; i < reviews.length; i++) {
            var review = reviews[i].toJSON();
            review.canDelete = review.author._id === username ? true : false;
            review.canVote = review.voters.indexOf(username) === -1 ? true: false;
            review.author = review.author.name;
            delete review.voters;
            output.push(review);
        }
    } else {
        var i;
        for (i = 0; i < reviews.length; i++) {
            var review = reviews[i].toJSON();
            review.canDelete = false;
            review.canVote = false;
            review.author = review.author.name;
            delete review.voters;
            output.push(review);
        }
    }
    
    return output;
}

/*
HELPER FUNCTON:
Parameters: the username of the review author and the request body
Does: creates a new review JSON (without a scope)
Returns: the JSON object to the caller
Assumption: All the fields mentioned are properly formatted and specified
*/
function makeNewReview(author, reqBody){
    var rating = reqBody.rating;
    var content = reqBody.content;
    var tags = reqBody.tags;
    var voters = [];
    //assumes the tags is a string of comma separated strings
    if (tags == undefined || tags.length === 0){
        tags = [];
    }
    else{
        //parse tags into an array
        var tags = tags.trim().split(/\s*,\s*/);
    }
    // Create a review JSON WITHOUT a scope
    var incompleteReview = {author: author, rating: rating, content: content,
                            score: 0, tags: tags, voters: voters};
    return incompleteReview;
}

// GET /reviews
// Request query:
//     - (OPTIONAL) dininghall: the name of the dining hall for which to find reviews
//     - (OPTIONAL) mealperiod: the name of the meal period for which to find reviews
//     - (OPTIONAL) tags: a comma-separated list of tags to search for
// Response:
//     - success: true if the search finished without error
//     - content: on success, an object with either one or three fields:
//         - (if dininghall was specified) score: the sum of all the star
//           ratings this dining hall has received so far, for a specific meal
//           period (if mealperiod was specified) or overall
//         - (if dininghall was specified) count: the number of reviews this
//           dining hall has received so far, for a specific meal period (if
//           mealperiod was specified) or overall
//         - reviews: an array containing the review objects that matched the search
//     - err: on failure, an error message
router.get('/', function(req, res) {
    var hall = req.query.dininghall;
    var period = req.query.mealperiod;
    
    if (hall) {
        if (period) {
            scopeSearch(req, res, hall, period);
        } else {
            hallSearch(req, res, hall);
        }
    } else {
        var query = {};
        attachTags(req, query);

        var handle = getReviewHandle(query);
        handle.exec(function (err, reviews) {
            if (err) {
                utils.sendErrResponse(res, 500, 'Unknown error.');
            } else {
                reviews = parseReviews(req, reviews);
                utils.sendSuccessResponse(res, {reviews: reviews});
            }
        });
    }
});

// POST /reviews
// Request body:
//     - hall: the dining hall that this review is for
//     - period: the meal period that this review is for
//     - rating: the star rating for the review, a number from 1-5
//     - content: the text content of the review
//     - (OPTIONAL) tags: a comma-separated list of tags to apply to the review
// Response:
//     - success: true if the review was successfully submitted
//     - content: on success, an object with a single field 'review', which
//                contains the review that was just posted
//     - err: on failure, an error message
router.post('/', utils.requireLogin, function(req, res) {
    var user = req.session.username;
    var scope = {hall: req.body.hall, period: req.body.period};
    var my_review_JSON = makeNewReview(user, req.body);

    if (!(req.body.hall && req.body.period && req.body.content && req.body.rating)){
        utils.sendErrResponse(res, 403, 'All fields except tags are required');
        return;
    }

    Scope.findOne(scope, function(err, doc) {
        if (err) {
            utils.sendErrResponse(res, 500, "Unknown Error");
        } else {
            if (doc) {
                var scopeID = doc._id;
                my_review_JSON.scope = scopeID;
                var newReview = new Review(my_review_JSON);
                
                doc.numStars += newReview.rating;
                doc.totalReviews++;
                doc.save(function(err, doc2) {
                    if (err) {
                        console.log("Error updating scope score");
                    }
                });

                newReview.save(function(err, review) {
                    if (err) {
                        utils.sendErrResponse(res, 500, "Unknown Error");
                    } else {
                        review.populate('scope author', function(err, doc) {
                            if (err) {
                                utils.sendErrResponse(res, 500, "Unknown Error");
                            } else {
                                doc.author = doc.author.name;
                                utils.sendSuccessResponse(res, doc); // doc : populated review
                            }
                        });
                    }
                });
            } else {
                utils.sendErrResponse(res, 403, "That combination of dining" +
                        " hall and meal period does not exist.");
            }
        }
    });
});

// DELETE /reviews/:review_id
// Request parameters:
//     - review_id: a String representation of the MongoDB _id of the review
// Response:
//     - success: true if the review was successfully deleted
//     - err: on failure, an error message
router.delete('/:review_id', utils.requireLogin, function(req, res) {
    var user = req.session.username; // sessions usernames
    var review_id = req.params.review_id;

    if (!(req.session.username)) {
        utils.sendErrResponse(res, 403, 'You must be signed in to do this action.');
        return;
    }

    Review.findById(review_id, function(err, doc){
        if (err) {
            utils.sendErrResponse(res, 500, "Unknown Error");
        } else {
            if (doc) {
                if (doc.author === user) {
                    Scope.findById(doc.scope, function(err, scope) {
                        scope.numStars -= doc.rating;
                        scope.totalReviews--;
                        scope.save(function(err, doc2) {
                            if (err) {
                                console.log("Error updating scope score");
                            }
                        });
                    });
                    
                    doc.remove(function(err) {
                        if (err) {
                            utils.sendErrResponse(res, 500, "Unknown Error");
                        } else{
                            //success
                            utils.sendSuccessResponse(res); //nothing to send
                        }
                    });
                } else {
                    utils.sendErrResponse(res, 403,
                            "You are not eligible to delete this review.");
                }
            } else{
                utils.sendErrResponse(res, 404,
                        "Could not find the review you are looking for.");
            }
        }
    });
});

module.exports = router;
