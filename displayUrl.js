const oauth = require('./discordApi')
const url = oauth.generateAuthUrl({
	scope: ["identify", "guilds"],
});

console.log(url)