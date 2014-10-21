var express = require('express');
var router = express.Router();

var utils = require("../../utils/utils");
var Scope = require("../../data/models").Scope;
var Review = require("../../data/models").Review;
var User = require("../../data/models").User;

/*
HELPER FUNCTON:
Parameters: the req.body gathered from the form
Does: creates a new review JSON (without a scope)
Returns: the JSON object to the caller
Assumption: All the fields mentioned are properly formatted and specified
*/
function makeNewReview(reqBody){
    var author = reqBody.author;
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

/*POST /reviews/post : Post the Review to the database and updates the User's reviews list
 Request parameters:
     - none
 Response:
     - success: true if the review was successfully submitted
     - err: on failure, an error message
ASSUMPTION: on the form, store the user as author in an invisible field
*/
router.post('/', utils.requireLogin, function(req, res) {
	//Temporary user name placeholder == user
	var user = req.session.username;
	//TEST: var scope = {hall:"baker", period:"brunch"}
	var scope = {hall:req.body.hall, period:req.body.period};
	//checks if the user is authenticated
	var my_review_JSON = makeNewReview(req.body);
	//TEST:var my_review_JSON = {author:user, rating:3, score:3, voters:[], tags:[], content: "lalala"};
	//find the scopeID, and add it to the my_review_JSON
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
                        console.log('2');
					}
					else{
						var reviewID = newReview._id;
						//add the review ID to the user's list of reviews
						User.update({_id:user}, {$push:{reviews:reviewID}}, {upsert:true}, function(e, doc){
							if (e){
								utils.sendErrResponse(res, 500, "Unknown Error: There was a problem adding the review to your list of reviews");
                                console.log('3');
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
