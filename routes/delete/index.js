var express = require('express');
var router = express.Router();

var utils = require("../../utils/utils");
var Review = require("../../data/models").Review;

/*GET /reviews/delete/:REVIEW_ID : Remove the review from the Database
 Request parameters:
     - the ID of the review to be removed
 Response:
     - success: true if the review was successfully removed
     - err: on failure, an error message
ASSUMPTION: the user is identifiable from certificates
*/
router.get('/:review_id',utils.requireLogin, function(req, res) {
	var user = req.session.username; // sessions usernames
	var review_id = req.params.review_id;

	Review.findOne({_id:review_id}, function(err, doc){
		if (err){
			utils.sendErrResponse(res, 500, "Unknown Error: Could not find the review you want.");
		}
		else{
			if (doc !== null){
				if (doc.author == user){
					Review.findByIdAndRemove(review_id, function(e, docs){
						if (e){
					        res.send("There was a problem deleting your post.");
					    }else{
					        docs.save();
					        //success
					        utils.sendSuccessResponse(res, {}); //nothing to send
					    }
					});
				}else{
					utils.sendErrResponse(res, 403, "You are not eligible to delete this review.");
				}
			}else{
				utils.sendErrResponse(res, 404, "Could not find the review you are looking for.");
			}
		}
	});
});

module.exports = router;

