// Login/signup page JavaScript (author: Sophia)
$(function() {
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
    
    $("#login-form").submit(function(e) {
        clearAlerts();
        var loginData = $(this).serializeArray();
        $.ajax({
            url: '/users/login',
            type: "POST",
            data: loginData,
            dataType: "json",
            success: function(response) {
                window.location.href = '/';
            },
            error: error
        });
        e.preventDefault();
    });
    
    $("#signup-form").submit(function(e) {
        clearAlerts();
        var signupData = $(this).serializeArray();
        $.ajax({
            url: '/users/signup',
            type: "POST",
            data: signupData,
            dataType: "json",
            success: function(response) {
                $("#signup-form").trigger('reset');
                $('#success-container').text('Account successfully created. ' +
                        'A verification email has been sent to ' +
                        response.content.username + '@mit.edu. You must ' +
                        'verify your account before logging in.');
                $('#success-container').slideDown();
            },
            error: error
        });
        e.preventDefault();
    });
});