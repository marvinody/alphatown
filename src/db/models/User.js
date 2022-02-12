const Sequelize = require('sequelize')
const db = require('../db')

const User = db.define('user', {
  discordId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  isAdmin: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  }
})

module.exports = User

