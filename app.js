var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');
var reviews = require('./routes/reviews');
var tests = require('./routes/tests');

var models = require('./data/models');

var app = express();

// Connect to MongoDB
var connection_string = 'localhost/ps3';

if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
    connection_string = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' +
            process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +
            process.env.OPENSHIFT_MONGODB_DB_PORT + '/ps3';
}

mongoose.connect('mongodb://' + connection_string);

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
    app.set('db', db);
});

// Set up Express sessions
app.use(session({secret: 'asdlfkj'}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/reviews', reviews);
app.use('/tests', tests);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var port = process.env.OPENSHIFT_NODEJS_PORT;
var ip = process.env.OPENSHIFT_NODEJS_IP;
app.listen(port || 8080, ip);

module.exports = app;

var User = models.User;
User.findById('foodback', function(err, doc) {
	var ObjectID = require('mongodb').ObjectID;
	doc.verified = true;
	doc.token = new ObjectID().valueOf();
	doc.save(function(err) {});
});