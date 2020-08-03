/**
 * See index.js for routing to this point.
 * This route handles requests regarding experiment scenarios.
 */
module.exports = function (options) {
    const express = require('express');
    var router = express.Router();

    const util = require('../../common/util');

    const ScenarioModel = require('../../models/ScenarioModel');

    /**
     * Get a list of the current user's scenarios.
     * @param void
     * @return [{id, name, description}]
     */
    router.get('/', (req, res) => {
        req.session.user_id;

        ScenarioModel.find({ user_id: req.session.user_id }, (err, objs) => {
            if (err)
                res.status(500).json(util.failure('There was an fetching the scenario list.', err));
            else
                res.status(200).json(util.success('User\'s scenarios returned.',
                    {
                        scenarios: objs.reduce((o, obj) => {
                            o[obj._id] = { 
                                id: obj._id, 
                                name: obj.name, 
                                description: obj.description, 
                                survey: obj.survey 
                            };
                            return o;
                        }, {}),
                        scenarioList: objs.map(obj => obj._id)
                    }
                ));
        });
    });

    /**
     * Creates a new scenario document object associated with the current user's id.
     * @param void
     * @return scenario object
     */
    router.post('/', (req, res) => {

        let scenario = new ScenarioModel({
            user_id: req.session.user_id,
            name: req.body.meta.name,
            description: req.body.meta.description,
            survey: req.body.meta.survey,
            scenes: req.body.scenes,
            frames: req.body.frames,
            frameList: req.body.frameList
        });

        scenario.save((err, obj) => {
            if (err)
                res.status(500).json(util.failure('There was an error creating the scenario.', err));
            else 
                res.status(201).json(util.success('Scenario created.', {id: obj._id}));
        });
       
    });

    /**
     * Get a particular scenario.
     * @param void
     * @return scenario object
     */
    router.get('/:scenario_id', (req, res) => {
        let id = req.params.scenario_id;
        let uid = req.session.user_id;

        ScenarioModel.findOne({_id: id, user_id: uid}, (err, obj)=>{
            if (err)
                res.status(500).json(util.failure('There was an error retrieving the scenario.', err));
            else if (obj === null)
                res.status(400).json(util.failure('The requested scenario does not exist.'));     
            else 
                res.status(200).json(util.success('Scenario returned.',
                    { 
                        meta: {id: obj._id, name: obj.name, description: obj.description, survey: obj.survey},
                        vuex_state: obj.vuex_state,
                        scenes: obj.scenes,
                        frames: obj.frames,
                        frameList: obj.frameList,
                    }
                ));
        });
    });

    /**
     * Update a scenario.
     * @param Fields of scenario object to update.
    */
    router.put('/:scenario_id', (req, res) => {
        let id = req.params.scenario_id;
        let uid = req.session.user_id;

        if (options.config.noclobber) {
            res.status(400).json(util.failure('Warning: Resource deletion and overwrite disabled.'));
            return;
        }

        ScenarioModel.updateOne({_id: id, user_id: uid}, {$set: {
            name: req.body.meta.name,
            description: req.body.meta.description,
            survey: req.body.meta.survey,
            scenes: req.body.scenes,
            frames: req.body.frames,
            frameList: req.body.frameList
        }}, (err, result)=>{
            if (err)
                res.status(500).json(util.failure('There was an error updating the scenario.', err));
            else if (result.n !== 1)
                res.status(400).json(util.failure('The requested scenario does not exist.', result));
            else if (result.nModified !== 1)
                res.status(400).json(util.failure('The requested scenario could not be updated.', result));
            else 
                res.status(200).json(util.success('Scenario updated.'));
        });
    });
    
    /**
     * Delete a scenario.
     * @param void
     * @return 
     */
    router.delete('/:scenario_id', (req, res) => {
        let id = req.params.scenario_id;
        let uid = req.session.user_id;

        if (options.config.noclobber) {
            res.status(400).json(util.failure('Warning: Resource deletion and overwrite disabled.'));
            return;
        }

        ScenarioModel.deleteOne({_id: id, user_id: uid}, (err, result)=>{
            if (err)
                res.status(500).json(util.failure('There was an error deleting the scenario.', err));
            else if (result.n !== 1)
                res.status(400).json(util.failure('The requested scenario does not exist.', result));
            else if (result.deletedCount !== 1)
                res.status(400).json(util.failure('The requested scenario could not be deleted.', result));
            else
                res.status(200).json(util.success('Scenario deleted.'));
        });
    });

    // Simulation generation sub-route.
    router.use('/:scenario_id', require('./zip')(options));

    return router;
};
