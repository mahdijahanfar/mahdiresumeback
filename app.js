var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require("cors");
var session = require("express-session")

var indexRouter = require('./routes/index');
var messagesRouter = require('./routes/messages');
var commentsRouter = require('./routes/comments');
var panelRouter = require('./routes/panel');
var portfolioRouter = require('./routes/portfolio');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'webslesson',
  resave: true,
  saveUninitialized: true
}));

app.use('/', indexRouter);
app.use('/messages', messagesRouter)
app.use('/comments', commentsRouter)
app.use('/panel', panelRouter)
app.use('/portfolio', portfolioRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
