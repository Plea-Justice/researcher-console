const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const rfs = require('rotating-file-stream');

const options = require('./config');
const util = require('./common/util');

const app = express();

// Use the Jade template engine to generate views.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', options.trust_proxy);

// Use Morgan to log HTTP requests in Apache format.
// Rotate logs daily.
if (options.logs_enabled) {
    app.use(logger('combined', {
        stream: rfs.createStream('access.log', {
            interval: options.keep_logs, // rotate daily
            path: path.join(__dirname, options.log_dir)
        })
    }));
}

if (options.log_to_console) {
    app.use(logger('dev'));
}

// Connect to the database.
const mongoose = require('mongoose');
mongoose.set('debug', options.mongoose_debug);
mongoose.connect(options.mongo_uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true
});
const database = mongoose.connection;
database.on('error', ()=>console.log('Error connecting to database.'));
database.once('open', ()=>console.log('Connected to database.'));

// Set up a session store using the database.
// The session middleware automatically manages cookies on req/res objects.
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
app.use(session({
    secret: options.session_secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        // Sessiion ends at browser close.
        expires: false,
        secure: options.secure_cookies
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// Count the user's IP connections.
app.use(require('./middleware/userSessionCount').countUserSessions);

// Enable parsing of JSON payloads into req.body.
app.use(express.json());

// Enable parsing of URL encoded data into req.body.
app.use(express.urlencoded({ extended: false }));

// Enable parsing of Cookie header into req.cookies.
app.use(cookieParser());

// Enable Cross-Origin Requests
const cors = require('cors');
if (options.cors_enabled) {
    app.use(cors({ credentials: true, origin: options.cors_origin }));
}

// Serve preview and live published simulations.
app.use(require('./routes/sim-serve_v1')(options));

// Serve static files in public.
app.use(express.static(path.join(__dirname, 'public')));

// Serve the api from the selected route at the selected mount point.
app.use(options.api_mount_point, require(options.api_definition)(options));

// Serve the client.
if (options.serve_client) {
    app.use('/', express.static(options.client_dir));
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // If the request was made by XHR (API call), return a json object.
    if (req.path.startsWith('/api') || req.xhr) {
        res.status(err.status || 500);
        res.json(util.failure(err.message, err));
    // Otherwise, render an error page.
    } else {
        if (options.serve_client) {
            // For dynamic routes, send Nuxt's SPA fallback page.
            res.sendFile(path.resolve(options.client_dir, '200.html'));
        } else {
            res.status(err.status || 500);
            res.render('error');
        }
    }
});

module.exports = app;
