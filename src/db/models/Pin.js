const Sequelize = require('sequelize')
const db = require('../db')

const Pin = db.define('pin', {
  
  lat: {
    type:Sequelize.FLOAT,
    allowNull: false,
  },
  lng: {
    type:Sequelize.FLOAT,
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
    notEmpty: true,
    len: [1, 140],
  },
  imageUrl: {
    allowNull: true,
    type:Sequelize.STRING,
    validator: {
      isUrl: true,
    }
  }
})

module.exports = Pin

