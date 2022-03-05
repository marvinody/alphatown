var express = require('express');
var router = express.Router();
const oauth = require('../../discordApi')
const { Guild } = require('../db/models')
const { requireDiscordLogin, requireDiscordGuild } = require('../middleware')
const url = oauth.generateAuthUrl({
  scope: ["identify", "guilds"],
}) + "&test_query_param=true";

console.log({ url })


router.get('/:guildId', async (req, res, next) => {

  const guild = await Guild.findByPk(req.params.guildId)

  if (!guild) {
    return res.render('error', {
      title: 'Invalid Map',
      message: 'That map does not exist. Ask an admin to add it to this service or find one that\'s connected already.'
    })
  }

  res.render('guildMap', {
    title: "Alphatown | Discord Map",
    guildId: req.params.guildId,
    oauth_url: url,
  })
})

module.exports = router;
