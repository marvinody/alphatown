var express = require('express');
var router = express.Router();
const oauth = require('../../discordApi')
const url = oauth.generateAuthUrl({
  scope: ["identify", "guilds"],
});


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express', 
    message: "yo watuppp",
    oauth: url,
  });
});

router.get('/session-check', (req, res) => {
  if (req.session.counter) {
    req.session.counter++
  } else {
    req.session.counter = 1
  }

  console.log(req.session)
  res.send(`counter: ${req.session.counter}`)
})

module.exports = router;
