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
            review.author = review.author.name;
            delete review.voters;
        }
    } else {
        var i;
        for (i = 0; i < reviews.length; i++) {
            var review = reviews[i];
            review.canDelete = false;
            review.canVote = false;
            review.author = review.author.name;
            delete review.voters;
        }
    }
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
    if (tags == undefined){
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
