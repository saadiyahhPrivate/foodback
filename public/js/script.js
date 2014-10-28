// General JavaScript
// Post/delete reviews (author: Saadiyah)
// Get reviews (author: Abdi)
// Vote on reviews (author: Sophia)
function error(jqxhr) {
	var response = $.parseJSON(jqxhr.responseText);
	$('#error-container').text(response.err);
	$('#error-container').slideDown();
}

function clearAlerts() {
	$('#error-container').hide();
	$('#success-container').hide();
}

function logout() {
	$.ajax({
		url: '/users/logout',
		type: "GET",
		dataType: "json",
		success: function(response) {
			$('#user-header').text("");
			$('#user-header').append('<li><a href="/users/login">Log In or Sign Up</a></li>');
			$('#post_form').hide();
			$('#make_button').hide();
			$('.review_delete').hide();
			$('.review_vote').hide();
		},
		error: error
	});
}

// Saadiyah
function postReview() {
	clearAlerts();

    var review = {
        hall: $("#new_review_hall").val(),
        period: $("#new_review_period").val(),
        content: $("#new_review_content").val(),
        tags: $("#new_review_tags").val(),
        rating: $("#new_review_rating").val()
    }

    $.ajax({
        url: "/reviews",
        type: "POST",
        dataType: "json",
        data: review,
        success: function(data) {
        	$('#post_form').trigger('reset');
        	$('#success-container').text('Review successfully posted.');
			$('#success-container').slideDown();
        },
        error: error
    });
    return false; // to avoid reloading
}

// Saadiyah
function deleteReview() {
    var id = $(this).parent().data("id");

    $.ajax({
        url: "/reviews/"+ id,
        type: "DELETE",
        dataType: "json",
        success: function(data) {
            getReviews();
        },
        error:error
    });
    return false;
}

// Sophia
function upvote() {
    var id = $(this).parent().parent().data("id");

    $.ajax({
        url: "/reviews/vote/up/" + id,
        type: "POST",
        dataType: "json",
        success: function(data) {
            getReviews();
        },
        error:error
    });
    return false;
}

// Sophia
function downvote() {
    var id = $(this).parent().parent().data("id");

    $.ajax({
        url: "/reviews/vote/down/" + id,
        type: "POST",
        dataType: "json",
        success: function(data) {
            getReviews();
        },
        error:error
    });
    return false;
}

// Abdi
function toggleReviewForm() {
    var form = $('#post_form');
    var inView = form.data('inView');
    if (inView) {
        form.css('max-height','0');
        form.css('opacity','0');
    } else {
        form.css('max-height','40em');
        form.css('opacity','1');
    }
    inView = !inView;
    var inView = form.data('inView', inView);
}

// Abdi
function formatString(string) {
    if (string === "mccormick") {
    	string = "McCormick";
    } else {
    	string = string.replace('-', ' ');
        string = string.charAt(0).toUpperCase() + string.substring(1);
    }
    return string;
}

// Abdi
function reviewHeader(author, hall, period, rating) {
    if (rating > 1) {
    	var starText = '' + rating + ' stars';
    } else {
    	var starText = '' + rating + ' star';
    }
    
    var title = $('<span>').addClass('review_title').text(period + ' at ' +
    		hall + ': ' + starText);
    
    var by = $('<span>').addClass('review_author').text('Posted by ' + author);
    return $('<div>').addClass('review_heading').append(title, by);
}

// Abdi
function reviewBody(content, score, tags) {
	var contentHTML = '<p>' + content.replace(/\n\n/g, '</p><p>') + "</p>";
	contentHTML = contentHTML.replace(/\n/g, '<br \>');
    var content = $('<div>').addClass('review_content').append(contentHTML);
    if (score == 1) {
    	var score = $('<span>').addClass('review_score').text('1 point');
    } else {
    	var score = $('<span>').addClass('review_score').text(score + ' points');
    }
    var tagsSpan = $('<span>').addClass('review_tags').text('Tagged in: ');
    
    if (tags.length > 0) {
    	var i;
        for (i = 0; i < tags.length; i++) {
            var tag = $('<span>').addClass('review_tag').text(tags[i]);
            tagsSpan.append(tag);
        }
        return $('<div>').addClass('review_body').append(content, tagsSpan, score);
    } else {
    	return $('<div>').addClass('review_body').append(content, score);
    }
    
}

// Abdi
function createReviewDiv(review) {
	var author = review.author,
		hall = formatString(review.scope.hall),
		period = formatString(review.scope.period),
		rating = review.rating,
		content = review.content,
		tags = review.tags,
		score = review.score,
		id = review._id;

		var header = reviewHeader(author, hall, period, rating);
		var body = reviewBody(content, score, tags);
		
		if (review.canVote) {
			var up = $('<button>').addClass('btn btn-sm btn-primary review_upvote').text('+1'),
				down = $('<button>').addClass('btn btn-sm btn-primary review_downvote').text('-1');

			var vote = $('<span>').addClass('review_vote');
			vote.append(up, down);
			body.append(vote);
		}

		if (review.canDelete) {
			var del = $('<button>').addClass('btn btn-sm btn-danger review_delete').text('Delete');
			body.append(del);
		}

		var reviewDiv = $('<div>').addClass('panel-body review').append(header, body);
		reviewDiv.data('id', id);
		
		var reviewWrapper = $('<div>').addClass('panel panel-default').append(reviewDiv);

		return reviewWrapper;
}

// Abdi
function getReviews() {
	var base_url = '/reviews',
		hall = $('#search_hall').val(),
		period = $('#search_period').val(),
		tags = $('#search_tags').val();

	if (hall !== 'all') {
		base_url += '?dininghall=' + hall;
		if (period !== 'all') {
			base_url += '&mealperiod=' + period;
		}
		base_url = tags === "" ? base_url : base_url + '&tags=' + tags;
	} else {
		base_url = tags === "" ? base_url : base_url + '?tags=' + tags;
	}

	$.ajax({
		url: base_url,
		type: 'GET',
		datatype: 'json',
		success: function (data) {
			var reviews = data.content.reviews,
				reviewsDiv = $('#reviews'),
				i;

			reviewsDiv.text('');
			
			var score = data.content.score;
			var count = data.content.count;
			if (score != undefined) {
				var scopeText = formatString(hall);
				if (period !== 'all') {
					scopeText = formatString(period) + ' at ' + scopeText;
				}
				
				if (count > 0) {
					var average = (score / count).toFixed(2);
					scopeText = scopeText + ' has an average rating of ' +
							average + ' stars.';
				} else {
					scopeText = scopeText + ' has not been rated yet.';
				}
				
				reviewsDiv.append('<h3>' + scopeText + '</h3>');
			}
	
			for (i = 0; i < reviews.length; i++) {
				var div = createReviewDiv(reviews[i]);
				reviewsDiv.append(div);
			}
			
			$(".review_delete").click(deleteReview);
			$(".review_upvote").click(upvote);
			$(".review_downvote").click(downvote);
		},
		error: error
	});

	return false;
}

$(function () {
    $('#error-container').hide();
    $('#success-container').hide();
    $('#post_form').data('inView', false);
    $('#make_button').click(toggleReviewForm);
    $('#post_button').click(postReview);
    $('#logout-link').click(logout);
	$('#search_hall, #search_period').change(getReviews);
	$('#tags_button').click(getReviews);
	getReviews();
});
