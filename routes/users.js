// User accounts feature
// author: Sophia

var NAME_MAX_LENGTH = 20;
var PASSWORD_MAX_LENGTH = 30;
// According to http://kb.mit.edu/confluence/x/QwTn a valid Kerberos ID is "3-8
// characters long, containing only lowercase letters and/or numbers."
var KERBEROS_REGEX = /^[a-z0-9]{3,8}$/;

var express = require('express');
var router = express.Router();
var models = require('../data/models');
var utils = require('../utils/utils');

var User = models.User;

// Sets the user with the given username as the logged-in user.
var loginUser = function(req, username) {
    req.session.username = username;
}

// Checks that a string is a valid MIT Kerberos ID. Returns true if it is valid,
// or false otherwise.
var validateKerberos = function(kerberos) {
	return KERBEROS_REGEX.test(kerberos);
}

// Login/signup page
router.get('/login', function(req, res) {
	res.render('login');
});

// POST /users/signup
// Request body:
//     - kerberos: the user's Kerberos ID, i.e. the part of their email before
//                 the @mit.edu
//     - name: the first name of the user; must be <= 20 chars
//     - password: the password to use for the account; must be <= 30 chars
// Response:
//     - success: true if the user was created and logged in
//     - content: on success, an object with a single field 'username', which
//                contains the username that has been granted to the new user
//                (same as their Kerberos)
//     - err: on failure, an error message
router.post('/signup', function(req, res, next) {
    if (req.session.username) {
        utils.sendErrResponse(res, 403, 'You are already logged in');
        return;
    }

    var kerberos = req.body.kerberos;
    var name = req.body.name;
    var password = req.body.password;

    // Input validation
    if (!(kerberos && name && password)) {
        utils.sendErrResponse(res, 403, 'All fields are required');
        return;
    }
    var username = kerberos.toLowerCase();
    if (!validateKerberos(username)) {
        utils.sendErrResponse(res, 403,
                'You did not enter a valid Kerberos ID.');
        return;
    }
    if (name.length > NAME_MAX_LENGTH) {
    	utils.sendErrResponse(res, 403, 'Name cannot exceed ' +
                NAME_MAX_LENGTH + ' characters.');
        return;
    }
    if (password.length > PASSWORD_MAX_LENGTH) {
        utils.sendErrResponse(res, 403, 'Password cannot exceed ' +
                PASSWORD_MAX_LENGTH + ' characters.');
        return;
    }

    // Inputs okay, begin database work
    User.findById(username, function(err, doc) {
        if (!err) {
            if (doc) {
                utils.sendErrResponse(res, 403,
                        'An account already exists for ' +
                        username + '@mit.edu');
            } else {
                var user = new User({
                    _id: username,
                    name: name,
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
    username = username.toLowerCase();
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
    req.session.destroy(function (err) {
        if (err) {
            utils.sendErrResponse(res, 500, 'Logout failed.');
        } else {
            utils.sendSuccessResponse(res);
        }
    });
});

module.exports = router;
