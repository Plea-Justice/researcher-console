const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const rfs = require('rotating-file-stream');

const config = require('./config');
const util = require('./common/util');

const app = express();

// Use the Jade template engine to generate views.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Use Morgan to log HTTP requests in Apache format.
// Rotate logs daily.
if (config.logs_enabled) {
    app.use(logger('combined', {
        stream: rfs.createStream('access.log', {
            interval: config.keep_logs, // rotate daily
            path: path.join(__dirname, config.log_dir)
        })
    }));
}

if (config.log_to_console) {
    app.use(logger('dev'));
}

// Connect to the database.
const mongoose = require('mongoose');
mongoose.set('debug', config.log_to_console);
mongoose.connect(config.mongo_uri, {useUnifiedTopology: true, useNewUrlParser: true});
const database = mongoose.connection;
database.on('error', ()=>console.log('Error connecting to database.'));
database.once('open', ()=>console.log('Connected to database.'));

// Set up a session store using the database.
// The session middleware automatically manages cookies on req/res objects.
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: config.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 * 24 * 7},
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));


// Enable parsing of JSON payloads into req.body.
app.use(express.json());

// Enable parsing of URL encoded data into req.body.
app.use(express.urlencoded({ extended: false }));

// Enable parsing of Cookie header into req.cookies.
app.use(cookieParser());

// Enable Cross-Origin Requests
const cors = require('cors');
if (config.cors_enabled) {
    app.use(cors({credentials: true, origin: config.cors_origin}));
}

// Serve static files in public.
app.use(express.static(path.join(__dirname, 'public')));

// Serve the api from the selected route at the selected mount point.
app.use(config.api_mount_point, require(config.api_definition)({db: database, config: config}));

// Serve the client.
if (config.serve_client) {
    app.use('/', express.static(config.client_dir));
    
    // For dynamic routes, send Nuxt's SPA fallback page.
    app.use('/', (req, res)=>{
        res.sendFile(path.resolve(config.client_dir, '200.html'));
    });
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // If the request was made by XHR (API call), return a json object.
    if (req.xhr) {
        res.json(util.failure(err.message, err));
    // Otherwise, render an error page.
    } else {
        res.status(err.status || 500);
        res.render('error');
    }
});

module.exports = app;
