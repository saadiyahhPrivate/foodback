function error(jqxhr) {
	var response = $.parseJSON(jqxhr.responseText);
	$('#error-container').text(response.err);
	$('#error-container').show();
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

function postReview() {
    // Saadiyah

    return false; // to avoid reloading
}

$(function () {
	$('#error-container').hide();
    $('#post_form').data('inView', false);
    $('#make_button').click(toggleReviewForm);
    $('#post_button').click(postReview);
});
