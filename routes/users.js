// User accounts feature
// author: Sophia

var PASSWORD_MAX_LENGTH = 30;
var EMAIL_REGEX = /^\w+@mit\.edu$/;

var express = require('express');
var router = express.Router();
var models = require('../data/models');
var utils = require('../utils/utils');

var User = models.User;

// Sets the user with the given username as the logged-in user.
var loginUser = function(req, username) {
    req.session.username = username;
}

// Checks that an email address is a valid @mit.edu email address. Returns true
// if it is valid, or false otherwise.
var validateEmail = function(email) {
    return EMAIL_REGEX.test(email);
}

// POST /users/signup
// Request body:
//     - email: the email address to use for the account; must be @mit.edu
//     - password: the password to use for the account; must be <= 30 chars
// Response:
//     - success: true if the user was created and logged in
//     - content: on success, an object with a single field 'username', which
//                contains the username that has been granted to the new user
//                (the part of their email address before the @mit.edu)
//     - err: on failure, an error message
router.post('/signup', function(req, res, next) {
    if (req.session.username) {
        utils.sendErrResponse(res, 403, 'You are already logged in');
        return;
    }

    var email = req.body.email;
    var password = req.body.password;

    // Input validation
    if (!(email && password)) {
        utils.sendErrResponse(res, 403, 'Email and password are required');
        return;
    }
    if (!validateEmail(email)) {
        utils.sendErrResponse(res, 403,
                'Your email must be a valid "@mit.edu" email address');
        return;
    }
    if (password.length > PASSWORD_MAX_LENGTH) {
        utils.sendErrResponse(res, 403, 'Password cannot exceed ' +
                PASSWORD_MAX_LENGTH + ' characters.');
        return;
    }

    var username = email.substring(email.length - 8);

    // Inputs okay, begin database work
    User.findById(username, function(err, doc) {
        if (!err) {
            if (doc) {
                utils.sendErrResponse(res, 403,
                        'An account already exists for ' + email);
            } else {
                var user = new User({
                    _id: username,
                    password: password});
                user.save(function(err) {
                    if (!err) {
                        loginUser(req, username);
                        utils.sendSuccessResponse(res, {username: username});
                    } else {
                        utils.sendErrResponse(res, 500, 'Unknown error');
                    }
                });
            }
        } else {
            utils.sendErrResponse(res, 500, 'Unknown error');
        }
    });
});

// POST /users/login
// Request body:
//     - username: the user's username
//     - password: the user's password
// Response:
//     - success: true if the user was logged in
//     - err: on failure, an error message
router.post('/login', function(req, res, next) {
    if (req.session.username) {
        utils.sendErrResponse(res, 403, 'You are already logged in');
        return;
    }

    var username = req.body.username;
    var password = req.body.password;

    // Input validation
    if (!(username && password)) {
        utils.sendErrResponse(res, 403, 'Must enter a username and password');
        return;
    }

    // Inputs okay, attempt login
    User.findById(username, function(err, doc) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Unknown error');
        } else if (!doc) {
            // Do not give any information on whether this user exists
            utils.sendErrResponse(res, 403, 'Incorrect username or password');
        } else if (doc.password != password) {
            utils.sendErrResponse(res, 403, 'Incorrect username or password');
        } else {
            loginUser(req, username);
            utils.sendSuccessResponse(res);
        }
    });
});

// GET /users/logout
// Response:
//     - success: true if the user was logged out
//     - err: on failure, an error message
router.get('/logout', utils.requireLogin, function(req, res) {
    delete req.session.username;
    utils.sendSuccessResponse(res);
});

module.exports = router;
