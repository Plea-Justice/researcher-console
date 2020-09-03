/**
 * See index.js for routing to this point.
 * This route handles requests regarding scene frames.
 */

const fs = require('fs-extra');
const zip = require('cross-zip');
const path = require('path');
const os = require('os');

const util = require('../../common/util');
const ScenarioModel = require('../../models/ScenarioModel');
const AssetModel = require('../../models/AssetModel');
const { mandatoryRoute } = require('../../middleware/authenticateRoutes');

const assetTypes = util.assetTypes;


module.exports = function (options) {
    const express = require('express');
    // Access parent's parameters.
    var router = express.Router({ mergeParams: true });

    /**
     * Generate a simulation preview link.
     */
    router.post('/preview', async (req, res)=>{

        try {
            await generateSimulation(options, req);
            res.status(200).json(util.success('Simulation preview ready.'));
        } catch (err) {
            res.status(500).json(util.failure('Error generating simulation preview.', err));
        }
    });

    /**
     * Live publish a simulation. Requires authentication
     */
    router.post('/publish', mandatoryRoute, async (req, res)=>{
        const id = req.params.scenario_id;
        const uid = req.session.user_id;
        const tmpdir = util.simTmpDir(options, id);
        const servdir = util.simServDir(options, id);

        const permissions = await util.userPermissions(uid);
        if (!permissions.permitHosting) {
            res.status(400).json(util.failure('Not permitted.'));
            return;
        }

        try {
            await generateSimulation(options, req);
            
            fs.emptyDirSync(servdir);
            fs.copySync(tmpdir, servdir);

            res.status(200).json(util.success('Live simulation ready.'));
        } catch (err) {
            res.status(500).json(util.failure('Error publishing simulation.', err));
        }
    });

    /**
     * Generate a zipped simulation download.
     */
    router.post('/download', async (req, res)=>{
        const id = req.params.scenario_id;
        const tmpdir = util.simTmpDir(options, id);
        const zippath = util.simTmpZipPath(options, id);

        try {
            await generateSimulation(options, req);

            fs.removeSync(zippath);
            zip.zipSync(tmpdir, zippath);

            res.status(200).json(util.success('Simulation download ready.'));
        } catch (err) {
            res.status(500).json(util.failure('Error generating simulation download.', err));
        }
    });
    return router;
};

/**************************************************
 * Generate a simulation directory from a template.
 */
async function generateSimulation(options, req) {
    const id = req.params.scenario_id;
    const uid = req.session.user_id;
    const tmpdir = util.simTmpDir(options, id);
    const user_data_dir = util.userDir(options, uid);

    try {
        const scenario = await ScenarioModel.findOne({_id: id, user_id: uid});

        const scenes = scenario.scenes;
        const frames = scenario.frames;
        const frameList = scenario.frameList;
        const conditions = scenario.conditions;
        const conditionList = scenario.conditionList;

        // Requested assets by type.
        const requested = new Map();
        assetTypes.forEach(type => requested[type] = new Set());

        // TODO: Send error on no frames or scenes.
        const timelines = new Array(frames[frameList[0]].scenes.length).fill(0).map(() => new Array());

        for (const frameID of frameList) {
            let frame = frames[frameID];
            for (var i = 0; i < frame.scenes.length; ++i) {
                let sceneID = frame.scenes[i];

                if (!scenes[sceneID])
                    throw Error('SceneID does not exist.');
                    
                if (!scenes[sceneID].props)
                    continue;
                    
                // Check for bound scenes.
                if (typeof scenes[sceneID].props === 'string') {
                    sceneID = scenes[sceneID].props;
                    if (!scenes[sceneID])
                        throw Error('SceneID does not exist.');
                        
                    if (!scenes[sceneID].props)
                        continue;
                }

                const scene = scenes[sceneID].props;

                switch (scene.type) {
                case 'dialogue':
                    timelines[i].push(
                        {
                            'type': 'dialogue',
                            'name': frame.label,
                            'script': scene.script,
                            'actor': scene.actor,
                            'bg': scene.background,
                            'fg': scene.foreground
                        }
                    );
                    if (scene.actor) requested['actor'].add(scene.actor);
                    if (scene.foreground) requested['foreground'].add(scene.foreground);
                    if (scene.background) requested['background'].add(scene.background);
                    break;
                case 'question':
                    timelines[i].push(
                        {
                            'type': 'dialogue',
                            'name': frame.label,
                            'script': scene.script,
                            'actor': scene.actor,
                            'bg': scene.background,
                            'fg': scene.foreground,
                            'buttons': scene.buttons
                        }
                    );
                    if (scene.actor) requested['actor'].add(scene.actor);
                    if (scene.foreground) requested['foreground'].add(scene.foreground);
                    if (scene.background) requested['background'].add(scene.background);
                    break;
                case 'clip':
                    timelines[i].push(
                        {
                            'type': 'clip',
                            'name': frame.label,
                            'clip': scene.clip
                        }
                    );
                    if (scene.clip) requested['clip'].add(scene.clip);
                    break;
                default:
                    throw Error(`Improper scene type: ${scene.id}.`);
                }
            }
        }

        // Get the list of file paths and names without extension for each asset type.
        const assets = new Map();
        // assetTypes.forEach(type => assets[type] = 
        //         fs.readdirSync(path.join(user_data_dir, type))
        //             .map(x=>[path.join(type, x), x.replace(/\..*$/, '')]));
        const availableAssets = await AssetModel.find({$or: [{user_id: uid}, {public: true}]});
        availableAssets.forEach(asset => assets[asset.type] = [asset.path, asset.name]);

        // Add the requested files to the manifest.
        const usedAssets = availableAssets.filter(
            asset => requested[asset.type].has(asset.name)
        );

        //if (requested.size !== usedAssets.size)
        //    throw Error('One of the requested assets is unavailable.');
            
        // Copy in a clean simulation from the template directory.
        fs.emptyDirSync(tmpdir);
        assetTypes.map(type => fs.mkdirpSync(path.join(tmpdir, 'assets', type)));
        fs.copySync(path.normalize(options.sim_dir), tmpdir, {filter: src => !src.includes('.git')});
        
        // FIXME: Remove need for cache type. Do not use bitmap caching.
        fs.copySync(path.join(user_data_dir, 'cache'), path.join(tmpdir, 'assets', 'cache'));
        
        // Copy requested assets.
        usedAssets.forEach(asset => fs.copyFileSync(
            path.join(
                util.userDir(options, asset.user_id.toString()),
                asset.path
            ),
            path.join(tmpdir, 'assets', asset.path)
        ));

        // Create the manifest.
        const manifest = {
            'name': scenario.name,
            'description': scenario.description,
            // Simulation preload.js requires 'path' and 'manifest'.
            'path': 'assets/',
            // FIXME: Generate list of files.
            'manifest': usedAssets.map(asset => asset.path),
            // 'timelines' array used by simulation to render each in order.
            'conditions': timelines.map((scene_list, i) => ({
                'name': `Experimental Condition ${i+1}/${timelines.length}`,
                'scenes': scene_list
            })),
            'survey': scenario.survey || '/no-url-set.html'
        };

        fs.writeJSONSync(path.join(tmpdir, 'manifest.json'), manifest);

        // Generate condition summary table.
        const summary = conditionList.reduce((acc, curr, i)=>
            acc + `<tr><td>${i+1}</td><td>${conditions[curr].tags}</td></tr>`
        , ''); 

        util.fileMultipleReplace(path.join(tmpdir, 'index.html'), [
            [/{{\s*?n_conditions\s*?}}/g, timelines.length],
            [/{{\s*?study_name\s*?}}/g, `${scenario.name} (Preview)`],
            [/{{\s*?condition_descriptions\s*?}}/g, summary]
        ]);

    } catch (err) {
        console.log(`Generate: ${err}`);
        throw err;
    }
}