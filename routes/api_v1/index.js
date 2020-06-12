/**
 * See app.js for routing to this point.
 * Applicable documentation at https://expressjs.com/en/guide/routing.html.
 */

module.exports = function (options) {
    var express = require('express');
    var router = express.Router();

    // Authentication Route
    router.use('/auth', require('./auth')(options));

    // Scenario Route
    router.use('/s', require('./scenario')(options));

    // Default Route
    router.get('/', function (req, res) {
        res.render('index', { title: 'Simulation Configuration API', name: module.filename });
    });

    return router;
};
