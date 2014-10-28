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
    var review = {
        hall: $("#new_review_hall").val(),
        period: $("#new_review_period").val(),
        content: $("#new_review_content").val(), 
        tags: $("#new_review_tags").val(), 
        rating: $("#new_review_rating").val()
    }

    $.ajax({
        url: "/reviews/post",
        type: "POST",
        dataType: "json",
        data: review,
        success: function(data){
            if (data.success === true){
                location.reload();
                $("#new_review_message").text("");
            }
            else{
                $("#new_review_message").text("Failed to post review. Try again");
            }
        }, 
        error: function(jqxhr){
            $("#new_review_message").text("Failed to post review. Try again");
        }
    });
    return false; // to avoid reloading
}
