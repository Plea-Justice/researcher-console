/* Copyright (C) 2021 The Plea Justice Project
 *
 * Please see https://pleajustice.org for information about this project's
 * licensing and how you can make a contribution.
 */

/**
 * See index.js for routing to this point.
 * This route handles requests regarding experiment scenarios.
 */
module.exports = function (options) {
    const express = require('express');
    const router = express.Router();

    const util = require('../../common/util');

    const ScenarioModel = require('../../models/ScenarioModel');
    const UserModel = require('../../models/UserModel');

    router.get('/email_list/', async(req, res) =>{
        let list;
        try{
            list = await UserModel.distinct('email');
            console.log(list);
        }
        catch(err){
            res.send('');
            return;
        }
        res.send(list);
    })
    /*
    Get a User's ID from their email
    */
    router.get('/email/:email', async (req, res) => {
        const email = req.params.email;
        let obj;
        try {
            obj = await UserModel.findOne(
                {email: email}
            )
        } catch(err){
            res.send('');
            return;
        }
        if(obj !== null){
            res.send(obj._id);
        }
        else {
            res.send('');
        }
        
    })
    /*
    Get User's IDs from their email
    */
    router.get('/emails/:email', async (req, res) => {
        const email = req.params.email;
        let obj;
        try {
            obj = await UserModel.find(
                {email: email}, {_id: 1, username: 1, fullname: 1, email: 1}
            )
        } catch(err){
            res.send('');
            return;
        }
        res.send(obj)
        // console.log("here");
        // console.log(obj);
    })
    /*
    Get a User's email from their ID
    */
    router.get('/id/:user_id', async (req, res) => {
        const id = req.params.user_id;
        let obj;
        try{
            obj = await UserModel.findById(id);
        }
        catch(err){
            res.send('');
            return;
        }
        if(obj != null){
            res.send(obj.email);
            
        }
        else {
            res.send(id);
        }
    })
    /**
     * Get a list of the current user's scenarios.
     */
    router.get('/', async (req, res) => {
        const uid = req.session.user.id;
        let objs;

        try {
            objs = await ScenarioModel.find(
                await util.userIsAdmin(uid)
                    ? { /* Administrator may access all assets. */ }
                    : {
                        $or: [ { owner: uid }, { public: true }, {collaborators: uid}],
                    }
            );
            
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
                collaborators:  req.body.meta?.collaborators,
                description: req.body.meta?.description,
                citation: req.body.meta?.citation,
                survey:     req.body.meta?.survey,
                live:       req.body.meta?.live,
                public:     req.body.meta?.public,
                readOnly:   req.body.meta?.readOnly,
                assetList:  req.body.assetList,
                numScenes:  req.body.numScenes,
                scenes:     req.body.scenes,
                frames:     req.body.frames,
                frameList:  req.body.frameList,
                conditions: req.body.conditions,
                conditionList: req.body.conditionList,
                tags:       req.body.tags,
                tagSets:    req.body.tagSets,
                tagSetList: req.body.tagSetList,
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
            obj = await ScenarioModel.findOne(
                await util.userIsAdmin(uid)
                    ? { _id: id }
                    : { 
                        $or: [{_id: id, owner: uid}, {_id: id, collaborators: uid}],
                    }
            );
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
                $or: [{ owner: uid }, { public: true }, { collaborators: uid }]
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
            obj.collaborators = [];
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
            result = await ScenarioModel.updateOne(

                await util.userIsAdmin(uid)
                    ? { _id: id }
                    : { 
                        $or: [{_id: id, owner: uid}, {_id: id, collaborators: uid}],
                    }

                , { $set: {
                    name:       req.body.meta?.name,
                    description: req.body.meta?.description,
                    collaborators: req.body.meta?.collaborators,
                    citation: req.body.meta?.citation,
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
                    tags:       req.body.tags,
                    tagSets:    req.body.tagSets,
                    tagSetList: req.body.tagSetList,
                    assetList:  req.body.assetList,
                    status:     req.body.status,
                    modified:   Date.now()
                } }, { omitUndefined: true }
            );
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
