/**
 * See index.js for routing to this point.
 * This route handles requests regarding scene frames.
 */

module.exports = function (options) {
    var express = require('express');
    // Access parent's parameters.
    var router = express.Router({ mergeParams: true });

    router.get('/', (req, res) => {
        res.send('test');
    });

    router.use('/:frame_id/i', require('./scene'));
    return router;
};
