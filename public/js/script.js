function error(jqxhr) {
	var response = $.parseJSON(jqxhr.responseText);
	$('#error-container').text(response.err);
	$('#error-container').show();
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
		},
		error: error
	});
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
	$('#success-container').hide();
    $('#post_form').data('inView', false);
    $('#make_button').click(toggleReviewForm);
    $('#post_button').click(postReview);
    $('#logout-link').click(logout);
});
