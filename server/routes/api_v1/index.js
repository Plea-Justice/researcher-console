/**
 * See app.js for routing to this point.
 * Applicable documentation at https://expressjs.com/en/guide/routing.html.
 */

module.exports = function (options) {
    const express = require('express');
    const router = express.Router();

    const { authenticatedRoute, administratorRoute } = require('../../middleware/authenticateRoutes');

    // Authentication Route
    router.use('/auth', require('./auth')(options));

    // All routes defined after this line will require authentication.
    router.use(authenticatedRoute);

    // Scenario Route
    router.use('/scenarios', require('./scenario')(options));

    // Asset Route
    router.use('/assets', require('./assets')(options));

    router.use('/admin', administratorRoute, require('./admin')(options));

    // Default Route
    router.get('/', function (req, res) {
        res.render('index', { title: 'Simulation Configuration API', name: module.filename });
    });

    return router;
};
