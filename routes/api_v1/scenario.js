/**
 * See index.js for routing to this point.
 * This route handles requests regarding experiment scenarios.
 */
module.exports = function (options) {
    var express = require('express');
    var router = express.Router();

    var ScenarioModel = require('../../models/ScenarioModel');

    /**
     * Get a list of the current user's scenarios.
     * @param void
     * @return [{id, title, description}]
     */
    router.get('/', (req, res) => {
        req.session.user_id;

        ScenarioModel.find({ user_id: req.session.user_id }, (err, objs) => {
            if (err)
                res.status(500).json({
                    success: false,
                    message: 'There was an fetching the scenario list.',
                    return: err
                });
            else
                res.status(201).json({
                    success: true,
                    message: 'User\'s scenarios returned.',
                    return: objs.map(obj => ({ id: obj._id, title: obj.title, description: obj.description }))
                });
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
            title: req.body.title,
            description: req.body.description
        });

        scenario.save((err, obj) => {
            if (err)
                res.status(500).json({
                    success: false,
                    message: 'There was an error creating the scenario.',
                    return: err
                });
            else 
                res.status(201).json({
                    success: true,
                    message: 'Scenario created.',
                    return: {id: obj._id, title: obj.title, description: obj.description}
                });
        });
       
    });

    /**
     * Get a particular scenario.
     * @param void
     * @return scenario object
     */
    router.get('/:scenario_id', (req, res) => {
        let id = req.params.scenario_id;

        ScenarioModel.findById(id, (err, obj)=>{
            if (err)
                res.status(500).json({
                    success: false,
                    message: 'There was an error retrieving the scenario.',
                    return: err
                });            
            else 
                res.status(200).json({
                    success: true,
                    message: 'Scenario returned.',
                    return: obj
                });
        });
    });

    /**
     * Delete a scenario.
     * @param void
     * @return 
     */
    router.delete('/:scenario_id', (req, res) => {
        ScenarioModel.deleteOne(req.params.scenario_id, (err)=>{
            if (err)
                res.status(500).json({
                    success: false,
                    message: 'There was an error deleting the scenario.',
                    return: err
                });
            else
                res.status(200).json({
                    success: true,
                    message: 'Scenario deleted.',
                    return: null
                });
        });
    });

    // Sub-route to frame endpoint.
    router.use('/:scenario_id/i', require('./frame'));

    return router;
};
