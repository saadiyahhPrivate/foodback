var express = require('express');
var router = express.Router();

var models = require('./data/models');
var User = models.User,
    Review = models.Review,
    Scope = models.Scope;

router.use('/post', post);
router.use('/upvote', upvote);
router.use('/downvote', downvote);

router.get('/', function(req, res) {
    res.status(200).send('Search to be implemented.');
});

router.get('/:dininghall', function(req, res) {
    res.status(200).send({
        hall: req.params.dininghall
    });
});

router.get('/:dininghall/:mealperiod', function(req, res) {
    res.status(200).send({
        hall: req.params.dininghall,
        period: req.params.mealperiod
    });
});

module.exports = router;
