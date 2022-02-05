const Guild = require('./Guild')
const User = require('./User')
const Pin = require('./Pin')

User.hasOne(Pin)
Pin.belongsTo(User)

Guild.hasMany(Pin)
Pin.belongsTo(Guild)

module.exports = {
   Guild,
   User,
   Pin
}