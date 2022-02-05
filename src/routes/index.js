var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express', message: "yo watuppp" });
});

router.get('/session-check', (req, res) => {
  if(req.session.counter) {
    req.session.counter++
  } else {
    req.session.counter = 1
  }

  res.send(`counter: ${req.session.counter}`)
})

module.exports = router;
