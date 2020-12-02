/**
 * See index.js for routing to this point.
 * This route handles requests regarding scene frames.
 */

const fs = require('fs-extra');
const zip = require('cross-zip');
const path = require('path');

const util = require('../../common/util');
const ScenarioModel = require('../../models/ScenarioModel');
const AssetModel = require('../../models/AssetModel');
const { mandatoryRoute } = require('../../middleware/authenticateRoutes');

const assetTypes = util.assetTypes;


module.exports = function (options) {
    const express = require('express');
    // Access parent's parameters.
    const router = express.Router({ mergeParams: true });

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
        const uid = req.session.user.id;
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
    const uid = req.session.user.id;
    const tmpdir = util.simTmpDir(options, id);

    try {
        const scenario = await ScenarioModel.findOne({ _id: id, owner: uid });

        const scenes = scenario.scenes;
        const frames = scenario.frames;
        const frameList = scenario.frameList;
        const conditions = scenario.conditions;
        const conditionList = scenario.conditionList;
        const tags = scenario.tags;

        // Requested assets by type.
        const requested = new Map();
        Object.keys(assetTypes.spec)
            .forEach(type => requested[type] = new Set());

        // Get the list of file paths and names for each asset type.
        const assets = await AssetModel.find({
            $or: [{ owner: uid }, { public: true }]
        });

        const availableAssets = new Map();
        assets.forEach(
            (asset) => availableAssets[asset._id] = asset
        );

        // Add the requested files to the manifest.
        const requestedAssets = new Set();
        const addAsset = (prop) => {
            if (prop) {
                requestedAssets.add(availableAssets[prop.id]);
                return availableAssets[prop.id].name;
            }
            return null;
        };

        // TODO: Send error on no frames or scenes.
        const timelines = new Array(frames[frameList[0]].scenes.length)
            .fill(0)
            .map(() => new Array());

        for (const frameID of frameList) {
            const frame = frames[frameID];
            for (let i = 0; i < frame.scenes.length; ++i) {
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
                            'actor': addAsset(scene.actor),
                            'bg': addAsset(scene.background),
                            'fg': addAsset(scene.foreground)
                        }
                    );
                    break;
                case 'question':
                    timelines[i].push(
                        {
                            'type': 'dialogue',
                            'name': frame.label,
                            'script': scene.script,
                            'actor': addAsset(scene.actor),
                            'bg': addAsset(scene.background),
                            'fg': addAsset(scene.foreground),
                            'buttons': scene.buttons
                        }
                    );
                    break;
                case 'clip':
                    timelines[i].push(
                        {
                            'type': 'clip',
                            'name': frame.label,
                            'clip': addAsset(scene.clip)
                        }
                    );
                    break;
                default:
                    throw Error(`Improper scene type: ${scene.id}.`);
                }
            }
        }

        //if (requested.size !== usedAssets.size)
        //    throw Error('One of the requested assets is unavailable.');

        // Copy in a clean simulation from the template directory.
        fs.emptyDirSync(tmpdir);
        Object.keys(assetTypes.spec).map(type => fs.mkdirpSync(path.join(tmpdir, 'assets', type)));
        fs.copySync(path.normalize(options.sim_dir), tmpdir, { filter: src => !src.includes('.git') });

        // Copy requested assets.
        requestedAssets.forEach(asset => fs.copyFileSync(
            path.join(
                util.userDir(options, asset.owner._id.toString()),
                asset.path
            ),
            path.join(tmpdir, 'assets', asset.path)
        ));

        // Create the manifest.
        const manifest = {
            'name': scenario.name,
            'description': scenario.description,
            // FIXME: Generate list of files.
            'resources': Array.from(requestedAssets).map(asset => asset.path),
            'customizable_presets': [
                /* TODO: Add presets with a new interface feature. */
            ],
            // 'timelines' array used by simulation to render each in order.
            'conditions': timelines.map((scene_list, i) => ({
                'name': `Experimental Condition ${i+1}/${timelines.length}`,
                'scenes': scene_list,
                'presets': conditions[conditionList[i]].customizations
            })),
            'survey': scenario.survey || '/no-url-set.html'
        };

        fs.writeJSONSync(path.join(tmpdir, 'manifest.json'), manifest);

        // Generate condition summary table.
        const summary = conditionList.reduce((acc, curr, i)=>
            acc + `<tr><td>${i+1}</td><td>${conditions[curr].tags.map(id => tags[id].name)}</td></tr>`
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
