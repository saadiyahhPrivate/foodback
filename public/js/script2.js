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

function createReviewHTML(review) {
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
            review.append(vote);
        }

        if (review.canDelete) {
            var del = $('<button>').addClass('review_delete').text('Delete');
            reviewDiv.append(del);
        }

        return review;
}

function getReviews() {
    var
}

$(function () {
    $('#error-container').hide();
    $('#success-container').hide();
    $('#post_form').data('inView', false);
    $('#make_button').click(toggleReviewForm);
    $('#post_button').click(postReview);
    $('#logout-link').click(logout);
});
