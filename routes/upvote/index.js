var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.status(200).send('Upvoting to be implemented.');
});

router.get('/:reviewid', function(req, res) {
  res.status(200).send(req.params.reviewid);
});

module.exports = router;
