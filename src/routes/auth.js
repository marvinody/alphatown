var express = require('express');
var router = express.Router();
const oauth = require('../../discordApi')
const { User, Pin } = require('../db/models')
const { requireDiscordLogin } = require('../middleware')

router.get('/discord/callback', async function (req, res, next) {
  if (req.query.code) {
    try {
      const discordAuth = await oauth.tokenRequest({
        code: req.query.code,
        scope: "identify guilds",
        grantType: "authorization_code",
      })

      const user = await oauth.getUser(discordAuth.access_token)

      await User.findOrCreate({
        where: {
          discordId: user.id,
        },
        defaults: {
          discordId: user.id,
        }
      })

      req.session.discord = {
        ...discordAuth,
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      }

      // bounce user back to main page
      res.redirect('/')
      return
    } catch (err) {
      res.send('error')
    }
  } else {
    res.send('no code');
  }
});

router.get('/logout', async (req, res, next) => {
  req.session.destroy((err) => {
    if(err) {
      return next(err)
    }
    res.sendStatus(204)
  });
})

router.get('/me', requireDiscordLogin, async (req, res, next) => {

  const pin = await Pin.findOne({
    include: {
      model: User,
      where: {
        discordId: req.session.discord.id,
      }
    }
  })

  res.json({
    authed: true,
    pin,
    username: req.session.discord.username,
    avatar: req.session.discord.avatar,
  })
})

module.exports = router;
