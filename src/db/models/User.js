const Sequelize = require('sequelize')
const db = require('../db')

const User = db.define('user', {
  discordId: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
})

module.exports = User

