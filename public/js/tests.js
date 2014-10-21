var review = {
	hall: 'simmons',
	period: 'brunch',
	rating: 5,
	content: 'The food was really good today!',
	tags: 'food,chef'
}

var user = {
	email: 'foodback@mit.edu',
	password: 'pa55w0rd',
	username: 'foodback'
}

var currentReviewId;

function error(xhr) {
	console.log(xhr.responseText);
}

// Assert that the given review is equivalent to the test review.
function checkReview(assert, newReview) {
	assert.strictEqual(newReview.author, user.username, 'Check author.');
    assert.strictEqual(newReview.scope.hall, review.hall, 'Check hall.');
    assert.strictEqual(newReview.scope.period, review.period, 'Check period.');
    assert.equal(newReview.rating, review.rating, 'Check rating.');
    assert.strictEqual(newReview.content, review.content, 'Check content.');
    assert.deepEqual(newReview.tags, ['food', 'chef'], 'Check tags.');
}

// Sophia
QUnit.test("Login Test", function(assert) {
    $.ajax({
        type: 'POST',
        url: '/users/login',
        data: user,
        dataType: 'json',
        success: function(data) {
            assert.ok(data.success, 'Login success.');
            postTest();
        },
        error: error
    });
});

// Saadiyah
function postTest() {
	QUnit.test("Post Test", function(assert) {
	    $.ajax({
            type: 'POST',
            url: '/reviews/post',
            data: review,
            dataType: 'json',
            success: function(data) {
                assert.ok(data.success, 'Post success.');
                checkReview(assert, data.content.review);
                currentReviewId = review._id;
                allReviewsTest();
            },
            error: error
        });
	});
}

// Abdi
function allReviewsTest() {
	QUnit.test("Get All Reviews", function(assert) {
		$.ajax({
	        type: 'GET',
	        url: '/reviews',
	        dataType: 'json',
	        success: function(data) {
	        	assert.ok(data.success, 'Query success.');
	        	checkReview(assert, data.content[0]);
	            allReviewsTestTags();
	        },
	        error: function(err) {
	        	error(err);
	        	allReviewsTestTags();
	        }
	    });
	});
}

// Abdi
function allReviewsTestTags() {
	QUnit.test("Get All Reviews with Tags", function(assert) {
		$.ajax({
	        type: 'GET',
	        url: '/reviews?tags=food,chef',
	        dataType: 'json',
	        success: function(data) {
	        	assert.ok(data.success, 'Query success.');
	        	checkReview(assert, data.content[0]);
	            hallReviewsTest();
	        },
	        error: function(err) {
	        	error(err);
	        	hallReviewsTest();
	        }
	    });
	});
}

// Abdi
function hallReviewsTest() {
	QUnit.test("Get Reviews by Dining Hall", function(assert) {
		$.ajax({
	        type: 'GET',
	        url: '/reviews/simmons',
	        dataType: 'json',
	        success: function(data) {
	        	assert.ok(data.success, 'Query success.');
	        	checkReview(assert, data.content[0]);
	            hallReviewsTestTags();
	        },
	        error: function(err) {
	        	error(err);
	        	hallReviewsTestTags();
	        }
	    });
	});
}

// Abdi
function hallReviewsTestTags() {
	QUnit.test("Get Reviews by Dining Hall with Tags", function(assert) {
		$.ajax({
	        type: 'GET',
	        url: '/reviews/simmons?tags=food,chef',
	        dataType: 'json',
	        success: function(data) {
	        	assert.ok(data.success, 'Query success.');
	        	checkReview(assert, data.content[0]);
	            scopeReviewsTest();
	        },
	        error: function(err) {
	        	error(err);
	        	scopeReviewsTest();
	        }
	    });
	});
}

// Abdi
function scopeReviewsTest() {
	QUnit.test("Get Reviews by Scope", function(assert) {
		$.ajax({
	        type: 'GET',
	        url: '/reviews/simmons/brunch',
	        dataType: 'json',
	        success: function(data) {
	        	assert.ok(data.success, 'Query success.');
	        	checkReview(assert, data.content[0]);
	            scopeReviewsTestTags();
	        },
	        error: function(err) {
	        	error(err);
	        	scopeReviewsTestTags();
	        }
	    });
	});
}

// Abdi
function scopeReviewsTestTags() {
	QUnit.test("Get Reviews by Scope with Tags", function(assert) {
		$.ajax({
	        type: 'GET',
	        url: '/reviews/simmons/brunch?tags=food,chef',
	        dataType: 'json',
	        success: function(data) {
	        	assert.ok(data.success, 'Query success.');
	        	checkReview(assert, data.content[0]);
	            upvoteTest();
	        },
	        error: function(err) {
	        	error(err);
	        	upvoteTest();
	        }
	    });
	});
}

// Sophia
function upvoteTest() {
	QUnit.test("Upvote Test", function(assert) {
		$.ajax({
	        type: 'GET',
	        url: '/reviews/vote/up/' + currentReviewId,
	        success: function(data) {
	            assert.ok(data.success, 'Upvote success.');
	            assert.strictEqual(data.content.score, 1, 'Check upvote.');
	            deleteTest();
	        },
	        error: function(err) {
	        	error(err);
	        	deleteTest();
	        }
	    });
	});
}

// Saadiyah
function deleteTest() {
	QUnit.test("Delete Test", function(assert) {
		$.ajax({
	        type: 'GET',
	        url: '/reviews/delete/' + currentReviewId,
	        success: function(data) {
	            assert.ok(data.success, 'Delete success.');
	            helperPost();
	        },
	        error: function(err) {
	        	error(err);
	        	helperPost();
	        }
	    });
	});
}

function helperPost() {
	$.ajax({
        type: 'POST',
        url: '/reviews/post',
        data: review,
        dataType: 'json',
        success: function(data) {
            currentReviewId = review._id;
            downvoteTest();
        },
        error: function(err) {
        	error(err);
        	logoutTest();
        }
    });
}

// Sophia
function downvoteTest() {
	QUnit.test("Downvote Test", function(assert) {
		$.ajax({
	        type: 'GET',
	        url: '/reviews/vote/down/' + currentReviewId,
	        success: function(data) {
	            assert.ok(data.success, 'Downvote success.');
	            assert.strictEqual(data.content.score, -1, 'Check downvote.');
	            logoutTest();
	        },
	        error: function(err) {
	        	error(err);
	        	logoutTest();
	        }
	    });
	});
}

// Sophia
function logoutTest() {
	QUnit.test("Logout Test", function(assert) {
		$.ajax({
	        type: 'GET',
	        url: '/users/logout',
	        success: function(data) {
	            assert.ok(data.success, 'Logout success.');
	        },
	        error: error
	    });
	});
}