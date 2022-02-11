const Sequelize = require('sequelize')
const db = require('../db')

const Guild = db.define('guild', {
  discordId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  }
})

class GuildDoesNotExistError extends Error {
  constructor() {
    super("The specified guild is not supported by our system")
    this.status = 404
  }
}

Guild.throwErrorIfBadGuild = async function (guildDiscordId) {
  const exists = await this.findOne({
    where: {
      discordId: guildDiscordId
    },
  })

  if (!exists) {
    throw new GuildDoesNotExistError()
  }

  return
}

module.exports = Guild

