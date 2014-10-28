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

function deleteReview(){
    var id = $(this).parent().data("id");

    $.ajax({
        url:"/reviews/"+ id,
        type: "DELETE",
        dataType:"json",
        success: function(data){
            $('#success-container').text('Review successfully deleted.');
            $('#success-container').slideDown();
        },
        error:error
    });
    return false;
}

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

function formatString(string) {
    string = string.replace('-', ' ');
    string = string.charAt(0).toUpperCase() + string.substring(1);
    return string;
}

function reviewHeader(author, hall, period, rating) {
    var title = $('<span>').addClass('review_title').text(period + ' at ' + hall);
    var by = $('<span>').addClass('review_author').text('Posted by' + author);
    var rating = $('<span>').addClass('review_rating').text(rating + ' stars');
    return $('<div>').addClass('review_heading').append(title, by, rating);
}

function reviewBody(content, score, tags) {
    var content = $('<p>').addClass('review_title').text(content);
    var score = $('<span>').addClass('review_score').text(score + ' points');
    var tags = $('<span>').addClass('review_tags').text('Tagged in: ');
    var i;
    for (i = 0; i < tags.length; i++) {
        var tag = $('<span>').addClass('review_tag').text(tags[i]);
        tags.append(tag);
    }
    return $('<div>').addClass('review_body').append(content, tags, score);
}

function createReviewDiv(review) {
	var author = review.author.name,
		hall = formatString(review.scope.hall),
		period = formatString(review.scope.period),
		rating = review.rating,
		content = review.content,
		tags = review.tags,
		score = review.score,
		id = review._id;

		var header = reviewHeader(author, hall, period, rating);
		var body = reviewBody(content, score, tags);

		var reviewDiv = $('<div>').addClass('review').append(header, body);
		reviewDiv.data('id', id);

		if (review.canVote) {
			var up = $('<button>').addClass('review_upvote').text('Approve'),
				down = $('<button>').addClass('review_upvote').text('Disappove');

			var vote = $('<span>').addClass('review_vote');
			vote.append(up, down);
			reviewDiv.append(vote);
		}

		if (review.canDelete) {
			var del = $('<button>').addClass('review_delete').text('Delete');
			reviewDiv.append(del);
		}

		return reviewDiv;
}

function getReviews() {
	var base_url = '/reviews',
		hall = $('#search_hall').val(),
		period = $('#search_period').val(),
		tags = $('#search_tags').val();

	if (hall !== 'all') {
		base_url += '/' + hall;
		if (period !== 'all') {
			base_url += '/' + period;
		}
	}

	base_url = tags === "" ? base_url : base_url + '?tags=' + tags;

	$.ajax({
		url: base_url,
		type: 'GET',
		datatype: 'json',
		success: function (data) {
			if (data.success) {
				var reviews = data.content,
					reviewsDiv = $('#reviews'),
					i;

				for (i = 0; i < 0; i++) {
					var div = createReviewDiv(reviews[i]);
					reviewsDiv.append(div);
				}
			} else {
				console.log(data);
			}
		},
		error: error
	});
}

$(function () {
    $('#error-container').hide();
    $('#success-container').hide();
    $('#post_form').data('inView', false);
    $('#make_button').click(toggleReviewForm);
    $('#post_button').click(postReview);
    $('#logout-link').click(logout);
    $(".review_delete").click(deleteReview);
	$('#search_hall, #search_period, #search_tags').change(getReviews);
	getReviews();
});
