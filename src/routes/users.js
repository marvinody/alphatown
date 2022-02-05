var express = require('express');
var router = express.Router();

const { User } = require('../db/models')

/* GET users listing. */


router.get('/', async (req, res, next) => {

  const users = await User.findAll()
  res.json(users)
})

module.exports = router;
