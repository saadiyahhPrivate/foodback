// Voting feature
// author: Sophia

var express = require('express');
var router = express.Router();
var models = require('../../data/models');
var utils = require('../../utils/utils');

var reviews = models.Review;

// Attempts to increment the score of the specified review by the specified
// vote amount.
var applyVote = function(req, res, review_id, vote) {
    reviews.findById(review_id, function(err, doc) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Unknown error');
        } else if (!doc) {
            utils.sendErrResponse(res, 404, 'Could not find that review');
        } else {
            var user = req.session.username;
            var valid = true;
            var voters = doc.voters;
            for (var i = 0; i < voters.length; i++) {
                if (voters[i] === user) {
                    valid = false;
                    break;
                }
            }

            if (!valid) {
                utils.sendErrResponse(res, 403, 'Already voted on this review');
            } else {
                doc.score += vote;
                voters.push(user);
                doc.save(function(err) {
                    if (err) {
                        utils.sendErrResponse(res, 500, 'Unknown error');
                    } else {
                        utils.sendSuccessResponse(res, {score: doc.score});
                    }
                });
            }
        }
    });
}

// GET /reviews/vote/up/:review_id
// Request parameters:
//     - review_id: a String representation of the MongoDB _id of the review
// Response:
//     - success: true if the vote was successfully submitted
//     - content: on success, an object with a single field 'score', which
//                contains the new score of the review
//     - err: on failure, an error message
router.get('/up/:review_id', utils.requireLogin, function(req, res) {
    applyVote(req, res, req.params.review_id, 1);
});

// GET /reviews/vote/down/:review_id
// Request parameters:
//     - review_id: a String representation of the MongoDB _id of the review
// Response:
//     - success: true if the vote was successfully submitted
//     - content: on success, an object with a single field 'score', which
//                contains the new score of the review
//     - err: on failure, an error message
router.get('/down/:review_id', utils.requireLogin, function(req, res) {
    applyVote(req, res, req.params.review_id, -1);
});

module.exports = router;
