var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var rfs = require('rotating-file-stream');

var config = require('./config');
var api = require(config.api_definition);

var app = express();

// Use the Jade template engine to generate views.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Use Morgan to log HTTP requests in Apache format.
// Rotate logs daily.
var accessLogStream = rfs.createStream('access.log', {
  interval: config.keep_logs, // rotate daily
  path: path.join(__dirname, config.log_dir)
});

// app.use(logger('combined', { stream: accessLogStream }));
app.use(logger('dev'));

// Enable parsing of JSON payloads into req.body.
app.use(express.json());

// Enable parsing of URL encoded data into req.body.
app.use(express.urlencoded({ extended: false }));

// Enable parsing of Cookie header into req.cookies.
app.use(cookieParser());

// Serve static files in public.
app.use(express.static(path.join(__dirname, 'public')));

// Serve these routes defined elsewhere.
app.use(config.api_mount_point, api);

// Serve the client.
app.use('/', express.static(config.client_dir));

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
