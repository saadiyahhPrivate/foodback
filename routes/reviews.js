var express = require('express');
var router = express.Router();

var post = require('./post/index');
var upvote = require('./upvote/index');
var downvote = require('./downvote/index');

router.use('/post', post);
router.use('/vote', vote);

router.get('/', function(req, res) {
    res.status(200).send('Search to be implemented.');
});

module.exports = router;
