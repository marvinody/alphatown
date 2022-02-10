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

class BadFileTypeError extends Error {
  constructor() {
    super('Invalid file type for image. Must be jpg/png')
    this.status = 400
  }
}

class ImgurUploadError extends Error {
  constructor() {
    super('Unable to upload to imgur')
    this.status = 500
  }
}

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

    const { lat, lng, title, desc } = req.body
    const { guildDiscordId } = req.params.guildId

    const checkFile = async () => {
      const { ext } = await FileType.fromBuffer(req.file.buffer)
      const allowedFiletypes = [
        'png',
        'jpg',
      ];

      if (!allowedFiletypes.includes(ext)) {
        throw new BadFileTypeError()
      }

    }

    try {

      const user = await oauth.getUser(req.session.discord.access_token)

      const pin = await Pin.findOne({
        where: {
          userDiscordId: user.id
        }
      })

      if (req.file && req.file.buffer) {
        await checkFile()
      }

      // user has pin linked, update existing (TODO)
      if (pin) {
        let imageUrl = pin.imageUrl
        if (req.file) {
          // we already checked the file above if it existed, so we're good to upload
          // push to imgur
          const imgurResult = await imgurUploader.uploadBuffer(req.file.buffer)
          if (!imgurResult.success) {
            throw new ImgurUploadError();
          }
          imageUrl = imgurResult.url
        }

        await pin.update({
          approved: false,
          lat,
          lng,
          title,
          desc,
          imageUrl,
        })

        return res.json(pin)
      }


      // continue with regular first pin creation...
      // push image to imgur
      const imgurResult = await imgurUploader.uploadBuffer(req.file.buffer)
      if (!imgurResult.success) {
        return res.json({ error: "Unable to upload to imgur" })
      }

      const newPin = await Pin.create({
        lat,
        lng,
        title,
        desc,
        imageUrl: imgurResult.url,
        userDiscordId: user.id,
        guildDiscordId,
      })

      res.json(newPin)

    } catch (err) {
      next(err)
    }

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
