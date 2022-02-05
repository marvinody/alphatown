const oauth = require('../discordApi')


class UnauthedError extends Error {
  constructor(msg) {
    super(msg || "You do not have proper permissiosn to view this URL")
    this.status = 403
  }
}

const requireDiscordLogin = (req, res, next) => {
  if(req.session?.discord?.access_token) {
    return next()
  }
  const error = new UnauthedError("You must be logged into discord to view this URL")
  next(error)
}

const requireDiscordGuild =  async (req, res, next) => {
  if(!req.session.discord?.guilds) {
    const guilds = await oauth.getUserGuilds(req.session.discord.access_token)

    // only save the guild IDs to limit size
    req.session.discord.guilds = guilds.map(g => g.id)
  }

  const isInCorrectGuild = req.session.discord.guilds.includes(req.params.guildId)

  if(isInCorrectGuild) {
    return next()
  }

  const error = new UnauthedError(`You are not a member of the correct server: ${req.params.guildId}`)
  next(error)
}


module.exports = {
  requireDiscordLogin,
  requireDiscordGuild,
}