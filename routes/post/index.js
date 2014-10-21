var express = require('express');
var router = express.Router();

var utils = require("../../utils/utils");
var Scope = require("../../data/models").Scope;
var Review = require("../../data/models").Review;
var User = require("../../data/models").User;

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
    var incompleteReview = {"author":author, "rating":rating, "content":content,
    						"score":0, "voters":[], "tags":tags, "voters":voters}
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
//     - err: on failure, an error message
router.post('/', utils.requireLogin, function(req, res) {
	var user = req.session.username;
	var scope = {hall:req.body.hall, period:req.body.period};
	var my_review_JSON = makeNewReview(user, req.body);
	Scope.findOne(scope, function(err, doc){
    	if (err){
    		utils.sendErrResponse(res, 500, "Unknown Error: Could not find the scope you defined.");
            console.log('1');
    	}
    	else{
    		if (doc !== null){
	    		var scopeID = doc._id;
	    		my_review_JSON.scope = scopeID; //add the scope to the review JSON
	    		var newReview = new Review(my_review_JSON); //make it into a review Object
	    		// now add the review to the database
				newReview.save(function(error, doc){
					if (error){
						utils.sendErrResponse(res, 500, "Unknown Error: An error occured while adding your review to the database");
					}
					else{
						var reviewID = newReview._id;
						//add the review ID to the user's list of reviews
						User.update({_id:user}, {$push:{reviews:reviewID}}, {upsert:true}, function(e, doc){
							if (e){
								utils.sendErrResponse(res, 500, "Unknown Error: There was a problem adding the review to your list of reviews");
							}
							else{
								//success
								utils.sendSuccessResponse(res, my_review_JSON);
								// TODO phase 3: page to be rendered
							}
						});
					}
				});
			}
			else{
				utils.sendErrResponse(res, 404, "Could not find the scope you defined.");
                console.log('4');
			}
	    }
	});

});

module.exports = router;
