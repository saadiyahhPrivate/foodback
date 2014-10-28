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
		},
		error: error
	});
}

function postReview() {
    // Saadiyah

    return false; // to avoid reloading
}
