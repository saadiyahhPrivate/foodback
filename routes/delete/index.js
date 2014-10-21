// Review delete feature
// author: Saadiyah

var express = require('express');
var router = express.Router();

var utils = require("../../utils/utils");
var Review = require("../../data/models").Review;

// GET /reviews/delete/:review_id
// Request parameters:
//     - review_id: a String representation of the MongoDB _id of the review
// Response:
//     - success: true if the review was successfully deleted
//     - err: on failure, an error message
router.get('/:review_id', utils.requireLogin, function(req, res) {
    var user = req.session.username; // sessions usernames
    var review_id = req.params.review_id;

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

module.exports = router;

