var express = require('express');
var router = express.Router();
const oauth = require('../../discordApi')
const { Pin } = require('../db/models')
const { requireDiscordLogin, requireDiscordGuild } = require('../middleware')
router.get('/', async (req, res, next) => {

  // add auth middleware for checking valid discord token

  const guilds = await oauth.getUserGuilds(req.session.discord.access_token)

  res.json(guilds)
});

router.get('/:guildId', async (req, res, next) => {

  const pins = await Pin.findAllPublic(req.params.guildId)

  res.json(pins)

})


router.get('/belongs-to/:guildId',
  requireDiscordLogin,
  requireDiscordGuild,
  async (req, res, next) => {
    res.json({
      guildId: req.params.guildId,
      member: true,
    })
  })

module.exports = router;
