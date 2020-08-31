/**
 * This file defines routes for serving temporary preview and permanent live simulations.
 * 
 * See app.js for routing to this point.
 * Applicable documentation at https://expressjs.com/en/guide/routing.html.
 */

module.exports = function (options) {
    const express = require('express');
    const router = express.Router();

    const fs = require('fs-extra');
    const path = require('path');
    const os = require('os');

    const { authenticatedRoute } = require('../middleware/authenticateRoutes');

    const preview_dir = path.join(os.tmpdir(), 'sim-prev');

    fs.ensureDir(preview_dir);
    router.use('/sim-prev', [authenticatedRoute, express.static(preview_dir)]);

    fs.ensureDir(options.sim_serve_dir);
    router.use('/sim-serve', express.static(options.sim_serve_dir));

    return router;
};
