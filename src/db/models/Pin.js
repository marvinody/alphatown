const Sequelize = require('sequelize')
const db = require('../db')

const Pin = db.define('pin', {

  lat: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  lng: {
    type: Sequelize.FLOAT,
    allowNull: false,
  },
  approved: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  title: {
    type: Sequelize.STRING,
    allowNull: false,
    notEmpty: true,
    len: [1, 80],
  },
  desc: {
    type: Sequelize.STRING,
    allowNull: true,
    notEmpty: false,
    len: [1, 140],
  },
  imageUrl: {
    allowNull: true,
    type: Sequelize.STRING,
    validator: {
      isUrl: true,
    }
  }
})

Pin.findAllPublic = async function (guildDiscordId) {
  return this.findAll({
    where: {
      approved: true,
      guildDiscordId,
    },
    attributes: 'lat lng title desc imageUrl createdAt updatedAt'.split(' ')
  })
}

Pin.findAllPending = async function (guildDiscordId) {
  return this.findAll({
    where: {
      approved: false,
      guildDiscordId,
    },
    include: 'user',
    attributes: 'lat lng title desc imageUrl createdAt updatedAt'.split(' ')
  })
}

module.exports = Pin

