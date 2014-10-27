$(document).ready(function() {
	$('#login-username').popover({
		trigger: 'focus',
		container: 'body',
		placement: 'left',
		content: 'Your username is the same as your MIT Kerberos ID.'
	});

	$('#signup-kerberos').popover({
		trigger: 'focus',
		container: 'body',
		placement: 'right',
		content: 'You must use your @mit.edu email address to sign up for a Foodback MIT account.'
	});

	$('#signup-name').popover({
		trigger: 'focus',
		container: 'body',
		placement: 'right',
		content: 'Your first name will be displayed with any reviews that you post. 20 character limit.'
	});

	$('#signup-password').popover({
		trigger: 'focus',
		container: 'body',
		placement: 'right',
		content: 'For your security, please do NOT use your MIT Kerberos password. 30 character limit.'
	});
});