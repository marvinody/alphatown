const db = require('../db')

;(async () => {
  await db.sync({
    force: true,
  })

})()