/**
 * See index.js for routing to this point.
 * This route handles requests regarding scene frames.
 */

module.exports = function (options) {
    const express = require('express');
    // Access parent's parameters.
    var router = express.Router({ mergeParams: true });

    const util = require('../../common/util');

    const fs = require('fs-extra');
    const zip = require('cross-zip');
    const path = require('path');
    const os = require('os');

    const ScenarioModel = require('../../models/ScenarioModel');

    const assetTypes = util.assetTypes;

    /**
     * Generate simulation.
     */
    router.post('/generate', async (req, res)=>{
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
            let timelines = new Array(frames[frameList[0]].scenes.length).fill(0).map(() => new Array());

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
            let assets = new Map();
            assetTypes.forEach(type => assets[type] = 
                fs.readdirSync(path.join(user_data_dir, type))
                    .map(x=>[path.join(type, x), x.replace(/\..*$/, '')]));

            // Add the requested files to the manifest.
            let files = new Set();
            assetTypes.forEach(type => assets[type].forEach(([file, name])=>{
                if (requested[type].has(name)) files.add(file);
            }));

            console.log('Requested files:');
            console.log(files);
            
            // Copy in a clean simulation from the template directory.
            fs.emptyDirSync(tmpdir);
            assetTypes.map(type => fs.mkdirpSync(path.join(tmpdir, 'assets', type)));
            fs.copySync(path.normalize(options.config.sim_dir), tmpdir, {filter: src => !src.includes('.git')});

            // Copy user's assets.
            files.forEach(file => fs.copyFileSync(
                path.join(user_data_dir, file),
                path.join(tmpdir, 'assets', file)
            ));

            // Create the manifest.
            let manifest = {
                'name': scenario.name,
                'description': scenario.description,
                // Simulation preload.js requires 'path' and 'manifest'.
                'path': 'assets/',
                // FIXME: Generate list of files.
                'manifest': Array.from(files),
                // 'timelines' array used by simulation to render each in order.
                'timelines': timelines.map((scene_list, i) => ({
                    'name': `Experimental Condition ${i+1}/${timelines.length}`,
                    'scenes': scene_list
                })),
                'survey': scenario.survey || '/no-url-set.html'
            };

            fs.writeJSONSync(path.join(tmpdir, 'manifest.json'), manifest);

            // Generate condition summary table.
            let summary = conditionList.reduce((acc, curr, i)=>
                acc + `<tr><td>${i+1}</td><td>${conditions[curr].name}</td></tr>`
            , ''); 

            util.fileMultipleReplace(path.join(tmpdir, 'index.html'), [
                [/{{\s*?n_conditions\s*?}}/g, timelines.length],
                [/{{\s*?study_name\s*?}}/g, `${scenario.name} (Preview)`],
                [/{{\s*?condition_descriptions\s*?}}/g, summary]
            ]);

            res.status(200).json(util.success('Simulation generated successfully.'));
        } catch (err) {
            console.log(err);
            res.status(500).json(util.failure('Error generating simulation.', err));
        }
    });

    /**
     * Generate ZIP.
     */
    router.post('/zip', async (req, res)=>{
        let id = req.params.scenario_id;

        try {
            let tmpdir = path.join(os.tmpdir(), 'sim-serve' , `sim-${id}`);
            let zippath = path.join(os.tmpdir(), 'sim-serve', `sim-${id}.zip`);

            let generated = await fs.pathExists(path.join(tmpdir, 'manifest.json'));
            if (!generated)
                throw Error('A simulation must be generated before it can be zipped.');

            await fs.remove(zippath);
            zip.zipSync(tmpdir, zippath);

            res.status(200).json(util.success('Simulation ZIP generated successfully.'));
        } catch (err) {
            console.log(err);
            res.status(500).json(util.failure('Error generating simulation ZIP.', err));
        }
    });

    return router;
};
