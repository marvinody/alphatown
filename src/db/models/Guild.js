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

module.exports = Guild

