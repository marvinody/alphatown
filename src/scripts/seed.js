const db = require('../db')
const { Pin, Guild, User } = require('../db/models');

; (async () => {
  await db.sync({
    force: true,
  })

  await Promise.all([
    Guild.create({ discordId: '1', name: 'one' }),
    Guild.create({ discordId: '123', name: 'onetwothree' }),
  ])


  await Promise.all([
    User.create({ discordId: 'user1', }),
    User.create({ discordId: 'user2', }),
    User.create({ discordId: 'user3', }),
  ])


  await Promise.all([
    Pin.create({
      lng: -77.038659,
      lat: 38.931567,
      approved: false,
      title: 'Lad Protects Mariss Here (not approved)',
      desc: 'Also some other buns here',
      imageUrl: 'https://i.imgur.com/jhDuL8e.jpg',
      guildDiscordId: '123',
      userDiscordId: 'user1',
    }),
    Pin.create({
      lng: -77.039659,
      lat: 38.931567,
      approved: true,
      title: 'Lad Protects Mariss Here 1 (approved)',
      desc: 'Also some other buns here',
      imageUrl: 'https://i.imgur.com/jhDuL8e.jpg',
      guildDiscordId: '123',
      userDiscordId: 'user2',
    }),
    Pin.create({
      lng: -77.037659,
      lat: 38.931567,
      approved: true,
      title: 'Lad Protects Mariss Here 2 (approved)',
      desc: 'Also some other buns here',
      imageUrl: 'https://i.imgur.com/jhDuL8e.jpg',
      guildDiscordId: '123',
      userDiscordId: 'user3',
    }),
  ])

})()