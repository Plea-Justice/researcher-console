/**
 * See index.js for routing to this point.
 * This route handles requests regarding individual conditions.
 */

module.exports = function (options) {
    var express = require('express');
    // Access parent's parameters.
    var router = express.Router({ mergeParams: true });

    router.get('/', (req, res) => {
        res.send('scenario' + req.params.scenario_id + 'scene' + req.params.i);
    });

    return router;
};
