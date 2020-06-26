/**
 * See index.js for routing to this point.
 * This route handles requests regarding scene frames.
 */

module.exports = function (options) {
    var express = require('express');
    // Access parent's parameters.
    var router = express.Router({ mergeParams: true });

    var fs = require('fs-extra');
    var zip = require('cross-zip');
    var path = require('path');
    var os = require('os');

    var ScenarioModel = require('../../models/ScenarioModel');

    /**
     * Generate and download a zipped simulation.
     */
    router.post('/', async (req, res)=>{
        let id = req.params.scenario_id;

        try {
            let scenario = await ScenarioModel.findById(id);
            let tmpdir = path.join(os.tmpdir(), `sim-${id}`);
            await fs.emptyDir(tmpdir);
            console.log(tmpdir);
            await fs.copy(path.normalize(options.config.sim_dir), tmpdir);
            await fs.copy(path.normalize(options.config.sim_dir), path.join(tmpdir, ));
            //await fs.remove(tmpdir);
            res.status(200).json({
                success: true,
                message: 'Simulation download ready.',
                return: null
            });

        } catch (err) {
            console.log(err);
            res.status(500).json({
                success: false,
                message: 'There was an error generating the simulation download.',
                return: err
            });
        }


    });

    return router;
};
