/**
 * See index.js for routing to this point.
 * This route handles requests regarding experiment scenarios.
 */
module.exports = function (options) {
    const express = require('express');
    const router = express.Router();

    const util = require('../../common/util');

    const ScenarioModel = require('../../models/ScenarioModel');


    /**
     * Get a list of the current user's scenarios.
     */
    router.get('/', async (req, res) => {
        const uid = req.session.user.id;
        let objs;

        try {
            objs = await ScenarioModel.find({
                $or: [{ owner: uid }, { public: true }]
            });
        } catch (err) {
            res.status(500).json(util.failure('There was an error fetching the scenario list.', err));
            return;
        }

        res.status(200).json(util.success('User\'s scenario metadata list returned.',
            {
                scenarios: objs.reduce((dict, obj) => {
                    dict[obj._id] = obj.meta;
                    return dict;
                }, {}),
                scenarioList: objs.map(obj => obj._id)
            }));
    });


    /**
     * Create a new scenario.
     */
    router.post('/', async (req, res) => {
        const uid = req.session.user.id;
        let obj;

        try {
            const scenario = new ScenarioModel({
                owner:       uid,
                author:      uid,
                name:       req.body.meta?.name,
                description: req.body.meta?.description,
                survey:     req.body.meta?.survey,
                live:       req.body.meta?.live,
                public:     req.body.meta?.public,
                readOnly:   req.body.meta?.readOnly,
                assetList:  req.body.meta?.assetList,
                numScenes:  req.body.numScenes,
                scenes:     req.body.scenes,
                frames:     req.body.frames,
                frameList:  req.body.frameList,
                conditions: req.body.conditions,
                conditionList: req.body.conditionList,
                status:     req.body.status
            });

            obj  = await scenario.save();
        } catch (err) {
            res.status(500).json(util.failure('There was an error creating the scenario.', err));
            return;
        }

        res.status(200).json(util.success(
            'Scenario created. Scenario metadata returned.', obj.meta
        ));
    });


    /**
     * Get a particular scenario.
     */
    router.get('/:scenario_id', async (req, res) => {
        const id = req.params.scenario_id;
        const uid = req.session.user.id;
        let obj;

        try {
            obj = await ScenarioModel.findOne({ _id: id, owner: uid });
        } catch (err) {
            res.status(500).json(util.failure('There was an error retrieving the scenario.', err));
            return;
        }

        if (!obj) {
            res.status(400).json(util.failure('The requested scenario does not exist.'));
            return;
        }

        res.status(200).json(util.success('Scenario returned.', {
            ...obj.data,
            meta: obj.meta
        }));
    });


    /**
     * Copy a scenario.
     */
    router.post('/:scenario_id', async (req, res) => {
        const id = req.params.scenario_id;
        const uid = req.session.user.id;
        let obj;

        try {
            obj = (await ScenarioModel.findOne({
                _id: id,
                $or: [{ owner: uid }, { public: true }]
            })).toObject();

            // Rename the copy. Increment copy count if chained.
            const list = (await ScenarioModel.find({
                owner: uid
            }, { name: true })).map(s => s.name);

            let suffix = '';
            const name = obj.name.replace(/( (Copy)( (\d+))?)?$/, '');

            const matches = list.map(
                x => x.match(`^${name}( (Copy)( (\\d+))?)?$`)
            ).filter(x => x);

            // If any copies already exist, this is also a copy.
            if (matches) {
                suffix += ' Copy';

                // If 'Copy' already exists, increment the number part
                if (matches.reduce((acc, x) => x[1] ? true : acc, false)) {
                    const n = Number(matches.reduce(
                        (max, x) => x[4] && x[4] > max ? x[4] : max, -1
                    ));

                    suffix += ` ${n < 1 ? 1 : n + 1}`;
                }
            }

            obj.name = name + suffix ;
            obj.owner = uid;
            obj.public = false;
            delete obj._id;
            delete obj.survey;
            delete obj.live;
            delete obj.created;
            delete obj.modified;

            obj = await ScenarioModel.create(obj);

        } catch (err) {
            console.log(err);
            res.status(500).json(util.failure('There was an error copying the scenario.', err));
            return;
        }

        res.status(200).json(util.success('Scenario metadata returned.', obj.meta));
    });


    /**
     * Update a scenario.
    */
    router.put('/:scenario_id', async (req, res) => {
        const id = req.params.scenario_id;
        const uid = req.session.user.id;
        let result;

        if (options.noclobber) {
            res.status(400).json(util.failure('Warning: Resource deletion and overwrite disabled.'));
            return;
        }

        try {
            result = await ScenarioModel.updateOne({
                _id: id,
                owner: uid
            }, { $set: {
                name:       req.body.meta?.name,
                description: req.body.meta?.description,
                survey:     req.body.meta?.survey,
                live:       req.body.meta?.live,
                public:     req.body.meta?.public,
                readOnly:   req.body.meta?.readOnly,
                numScenes:  req.body.numScenes,
                scenes:     req.body.scenes,
                frames:     req.body.frames,
                frameList:  req.body.frameList,
                conditions: req.body.conditions,
                conditionList: req.body.conditionList,
                assetList:  req.body.meta?.assetList,
                status:     req.body.status,
                modified:   Date.now()
            } }, { omitUndefined: true });
        } catch (err) {
            res.status(500).json(util.failure('There was an error updating the scenario.', err));
            return;
        }

        if (result.n !== 1)
            res.status(400).json(util.failure('The requested scenario does not exist.', result));
        else if (result.nModified !== 1)
            res.status(400).json(util.failure('The requested scenario could not be updated.', result));
        else
            res.status(200).json(util.success('Scenario updated.'));
    });


    /**
     * Delete a scenario.
     */
    router.delete('/:scenario_id', async (req, res) => {
        const id = req.params.scenario_id;
        const uid = req.session.user.id;
        let result;

        if (options.noclobber) {
            res.status(400).json(util.failure('Warning: Resource deletion and overwrite disabled.'));
            return;
        }
        try {
            result = await ScenarioModel.deleteOne({
                _id: id,
                owner: uid
            });
        } catch (err) {
            res.status(500).json(util.failure('There was an error deleting the scenario.', err));
            return;
        }

        if (result.n !== 1)
            res.status(400).json(util.failure('The requested scenario does not exist.', result));
        else if (result.deletedCount !== 1)
            res.status(400).json(util.failure('The requested scenario could not be deleted.', result));
        else
            res.status(200).json(util.success('Scenario deleted.'));
    });


    // Simulation generation sub-route.
    router.use('/:scenario_id', require('./sim-generate')(options));

    return router;
};
