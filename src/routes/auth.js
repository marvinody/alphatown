var express = require('express');
var router = express.Router();
const oauth = require('../../discordApi')
const { User } = require('../db/models')
router.get('/discord/callback', function (req, res, next) {
  if (req.query.code) {
    oauth.tokenRequest({
      code: req.query.code,
      scope: "identify guilds",
      grantType: "authorization_code",

    }).then(e => {
      console.log(e)
      req.session.discord = e
      // bounce user back to main page
      res.redirect('/')
      return
    }).catch(e => {
      console.log(e.response)
      res.send('error')
      return
    })
  } else {
    res.send('no code');
  }
});

module.exports = router;
