/**
 * See index.js for routing to this point.
 * This route handles requests regarding scene frames.
 */

module.exports = function (options) {
    var express = require('express');
    // Access parent's parameters.
    var router = express.Router({ mergeParams: true });

    var ScenarioModel = require('../../models/ScenarioModel');

    router.get('/', (req, res) => {
        let id = req.params.scenario_id;

        ScenarioModel.findById(id, (err, obj)=>{
            if (err)
                res.status(500).json({
                    success: false,
                    message: 'There was an error retrieving the scenario\'s frame list.',
                    result: err
                });            
            else 
                res.status(200).json({
                    success: true,
                    message: 'Frame list returned.',
                    result: obj.frames
                });
        });
    });

    router.use('/:frame_id/i', require('./scene')(options));
    return router;
};
