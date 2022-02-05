var express = require('express');
var router = express.Router();
const oauth = require('../../discordApi')
const { User } = require('../db/models')
const { requireDiscordLogin, requireDiscordGuild } = require('../middleware')
router.get('/', async (req, res, next) => {

  // add auth middleware for checking valid discord token

  const guilds = await oauth.getUserGuilds(req.session.discord.access_token)

  res.json(guilds)
});


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
