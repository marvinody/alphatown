var express = require('express');
var path = require('path');
const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const db = require('./db')
const sessionStore = new SequelizeStore({ db })

var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var pinsRouter = require('./routes/pins');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'pug')

// session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'maps are fun',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
  })
)

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

app.use('/users', usersRouter);
app.use('/auth', authRouter);
app.use('/pins', pinsRouter);

app.use((err, req, res, next) => {
  console.error(err)
  console.error(err.stack)
  const status = err.status || 500
  res.status(status)
  res.render('error', {
    title: `${status} Error`, 
    message: err.message || "Unexpected Server Error",
  });
})

module.exports = app;
