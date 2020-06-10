/**
 * See app.js for routing to this point.
 * Applicable documentation at https://expressjs.com/en/guide/routing.html.
 */
var express = require('express');
var router = express.Router();

const { runInNewContext } = require('vm');
const { config } = require('process');

// Authentication Route
router.use('/auth', require('./auth'));

// Scenario Route
router.use('/s', require('./scenario'));

// Default Route
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Simulation Configuration API', name: module.filename });
});

module.exports = router;
