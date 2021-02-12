require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const favicon = require('serve-favicon');
const logger = require('morgan');
const path = require('path');
const hbs = require('hbs')
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose')
const bodyParser = require('body-parser')


const authRouter = require('./routes/auth');
const privateRouter = require('./routes/private');
const recipesRouter = require('./routes/recipes');


// DB connection

mongoose.connect( process.env.MONGODB_URI   ,  {useNewUrlParser: true, useUnifiedTopology: true,})
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error("Error connecting to mongo", err);
  });



const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRouter);
app.use('/recipes', recipesRouter);
app.use('/private', privateRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;