var express = require('express');
var router = express.Router();
const oauth = require('../../discordApi')
const { User } = require('../db/models')
const { requireDiscordLogin, requireDiscordGuild } = require('../middleware')

router.get('/:guildId', async (req, res, next) => {
  res.render('guildMap', {
    title: "Server Maps",
    guildId: req.params.guildId
  })
})

module.exports = router;
