var express = require('express');
var router = express.Router();
const oauth = require('../../discordApi')
const { User } = require('../db/models')
const { requireDiscordLogin, requireDiscordGuild } = require('../middleware')
const url = oauth.generateAuthUrl({
  scope: ["identify", "guilds"],
})+"&test_query_param=true";

console.log({url})

router.get('/:guildId', async (req, res, next) => {
  res.render('guildMap', {
    title: "Server Maps",
    guildId: req.params.guildId,
    oauth_url: url,
  })
})

module.exports = router;
