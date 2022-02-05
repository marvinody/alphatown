var express = require('express');
var router = express.Router();
const oauth = require('../../discordApi')
const { User } = require('../db/models')
const { requireDiscordLogin } = require('../middleware')

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

router.get('/check', requireDiscordLogin, async (req, res, next) => {
  res.json({
    authed: true,
  })
})

module.exports = router;
