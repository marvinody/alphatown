var express = require('express');
var router = express.Router();
const oauth = require('../../discordApi')
const { User } = require('../db/models')

/* GET users listing. */
router.get('/auth/discord/callback', function (req, res, next) {

  if (req.query.code) {
    oauth.tokenRequest({
      code: req.query.code,
      scope: "identify guilds",
      grantType: "authorization_code",

    }).then(e => {
      console.log(e)
      res.send(e)
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

router.get('/', async (req, res, next) => {
  
  const users = await User.findAll()
  res.json(users)
})

module.exports = router;
