// Review post feature
// author: Saadiyah

var express = require('express');
var router = express.Router();

var utils = require("../../utils/utils");
var models = require("../../data/models");
var Scope = models.Scope;
var Review = models.Review;
var User = models.User;

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

// POST /reviews/post
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
                        var reviewID = doc._id;
                        User.update({_id: user}, {$push: {reviews: reviewID}},
                                {upsert:true}, function(err, user) {
                            if (err) {
                                utils.sendErrResponse(res, 500, "Unknown Error");
                            } else {
                                review.populate('scope', function(err, doc) {
                                    if (err) {
                                        utils.sendErrResponse(res, 500, "Unknown Error");
                                    } else {
                                        utils.sendSuccessResponse(res, doc); // doc : populated review
                                    }
                                });
                                // TODO phase 3: page to be rendered
                            }
                        });
                    }
                });
            } else {
                utils.sendErrResponse(res, 404,
                        "Could not find the scope you defined.");
            }
        }
    });

});

module.exports = router;
