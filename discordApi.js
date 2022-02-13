const DiscordOauth2 = require('discord-oauth2')

module.exports = ((clientId, clientSecret) => {
  const oauth = new DiscordOauth2({
    clientId,
    clientSecret,
    version: 'v9',
    redirectUri: process.env.REDIRECT_URI,
  })

  return oauth
})(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_CLIENT_SECRET)
