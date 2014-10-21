QUnit.config.reorder = false;

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
	start();
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
	stop();
    $.ajax({
        type: 'POST',
        url: '/users/login',
        data: user,
        dataType: 'json',
        success: function(data) {
            assert.ok(data.success, 'Login success.');
            start();
        },
        error: error
    });
});

// Saadiyah
QUnit.test("Post Test", function(assert) {
	stop();
    $.ajax({
        type: 'POST',
        url: '/reviews/post',
        data: review,
        dataType: 'json',
        success: function(data) {
            assert.ok(data.success, 'Post success.');
            checkReview(assert, data.content.review);
            currentReviewId = data.content.review._id;
            start();
        },
        error: error
    });
});

// Abdi
QUnit.test("Get All Reviews", function(assert) {
	stop();
	$.ajax({
        type: 'GET',
        url: '/reviews',
        dataType: 'json',
        success: function(data) {
        	assert.ok(data.success, 'Query success.');
        	checkReview(assert, data.content[0]);
            start();
        },
        error: error
    });
});

// Abdi
QUnit.test("Get All Reviews with Tags", function(assert) {
	stop();
	$.ajax({
        type: 'GET',
        url: '/reviews?tags=food,chef',
        dataType: 'json',
        success: function(data) {
        	assert.ok(data.success, 'Query success.');
        	checkReview(assert, data.content[0]);
            start();
        },
        error: error
    });
});

// Abdi
QUnit.test("Get Reviews by Dining Hall", function(assert) {
	stop();
	$.ajax({
        type: 'GET',
        url: '/reviews/simmons',
        dataType: 'json',
        success: function(data) {
        	assert.ok(data.success, 'Query success.');
        	checkReview(assert, data.content[0]);
            start();
        },
        error: error
    });
});

// Abdi
QUnit.test("Get Reviews by Dining Hall with Tags", function(assert) {
	stop();
	$.ajax({
        type: 'GET',
        url: '/reviews/simmons?tags=food,chef',
        dataType: 'json',
        success: function(data) {
        	assert.ok(data.success, 'Query success.');
        	checkReview(assert, data.content[0]);
            start();
        },
        error: error
    });
});

// Abdi
QUnit.test("Get Reviews by Scope", function(assert) {
	stop();
	$.ajax({
        type: 'GET',
        url: '/reviews/simmons/brunch',
        dataType: 'json',
        success: function(data) {
        	assert.ok(data.success, 'Query success.');
        	checkReview(assert, data.content[0]);
            start();
        },
        error: error
    });
});

// Abdi
QUnit.test("Get Reviews by Scope with Tags", function(assert) {
	stop();
	$.ajax({
        type: 'GET',
        url: '/reviews/simmons/brunch?tags=food,chef',
        dataType: 'json',
        success: function(data) {
        	assert.ok(data.success, 'Query success.');
        	checkReview(assert, data.content[0]);
            start();
        },
        error: error
    });
});

// Sophia
QUnit.test("Upvote Test", function(assert) {
	stop();
	$.ajax({
        type: 'GET',
        url: '/reviews/vote/up/' + currentReviewId,
        success: function(data) {
            assert.ok(data.success, 'Upvote success.');
            assert.strictEqual(data.content.score, 1, 'Check upvote.');
            start();
        },
        error: error
    });
});

// Saadiyah
QUnit.test("Delete Test", function(assert) {
	stop();
	$.ajax({
        type: 'GET',
        url: '/reviews/delete/' + currentReviewId,
        success: function(data) {
            assert.ok(data.success, 'Delete success.');
            start();
        },
        error: error
    });
});

QUnit.test("Post Test 2", function(assert) {
	stop();
    $.ajax({
        type: 'POST',
        url: '/reviews/post',
        data: review,
        dataType: 'json',
        success: function(data) {
            assert.ok(data.success, 'Post success.');
            checkReview(assert, data.content.review);
            currentReviewId = data.content.review._id;
            start();
        },
        error: error
    });
});

// Sophia
QUnit.test("Downvote Test", function(assert) {
	stop();
	$.ajax({
        type: 'GET',
        url: '/reviews/vote/down/' + currentReviewId,
        success: function(data) {
            assert.ok(data.success, 'Downvote success.');
            assert.strictEqual(data.content.score, -1, 'Check downvote.');
            start();
        },
        error: error
    });
});

QUnit.test("Delete Test 2", function(assert) {
	stop();
	$.ajax({
        type: 'GET',
        url: '/reviews/delete/' + currentReviewId,
        success: function(data) {
            assert.ok(data.success, 'Delete success.');
            start();
        },
        error: error
    });
});

// Sophia
QUnit.test("Logout Test", function(assert) {
	stop();
	$.ajax({
        type: 'GET',
        url: '/users/logout',
        success: function(data) {
            assert.ok(data.success, 'Logout success.');
            start();
        },
        error: error
    });
});
