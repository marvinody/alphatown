var express = require('express');
const multer = require('multer')
const ImgurAnonymousUploader = require('imgur-anonymous-uploader');
var router = express.Router();
const FileType = require('file-type');

const oauth = require('../../discordApi')
const { Pin } = require('../db/models')
const { requireDiscordLogin, requireDiscordGuild } = require('../middleware')


router.get('/', async (req, res, next) => {

  // add auth middleware for checking valid discord token

  const guilds = await oauth.getUserGuilds(req.session.discord.access_token)

  res.json(guilds)
});

router.get('/:guildId', async (req, res, next) => {

  const pins = await Pin.findAllPublic(req.params.guildId)

  res.json(pins)

})



const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fields: 10,
    fileSize: 10 * 1000 * 1000,
    files: 1,
  }
})
const imgurUploader = new ImgurAnonymousUploader(process.env.IMGUR_CLIENT_ID);

router.put('/:guildId',
  requireDiscordLogin,
  requireDiscordGuild,
  upload.single('image'),
  async (req, res, next) => {

    const user = await oauth.getUser(req.session.discord.access_token)

    const pin = await Pin.findOne({
      where: {
        userDiscordId: user.id
      }
    })

    if (req.file && req.file.buffer) {
      const { ext } = await FileType.fromBuffer(req.file.buffer)
      const allowedFiletypes = [
        'png',
        'jpg',
      ];

      if (!allowedFiletypes.includes(ext)) {
        return res.status(400).json({
          error: 'Invalid file type for image. Must be jpg/png'
        })
      }
    }

    // user has pin linked, update existing (TODO)
    if (pin) {
      return res.sendStatus(204)
    }

    // push image to imgur
    const imgurResult = await imgurUploader.uploadBuffer(req.file.buffer)
    if (!imgurResult.success) {
      return res.json({ error: "Unable to upload to imgur" })
    }

    const newPin = await Pin.create({
      lat: req.body.lat,
      lng: req.body.lng,
      title: req.body.title,
      desc: req.body.desc,
      imageUrl: imgurResult.url,
      userDiscordId: user.id,
      guildDiscordId: req.params.guildId,
    })

    res.json(newPin)
  }
)

router.get('/belongs-to/:guildId',
  requireDiscordLogin,
  requireDiscordGuild,
  async (req, res, next) => {
    res.json({
      guildId: req.params.guildId,
      member: true,
    })
  })

module.exports = router;
