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
    router.get('/', async (req, res)=>{
        let id = req.params.scenario_id;

        try {
            let scenario = await ScenarioModel.findById(id);
            let tmpdir = path.join(os.tmpdir(), `sim-${id}`);
            await fs.emptyDir(tmpdir);

            let user_data_dir = path.join(options.config.data_dir, req.session.user_id);

            // Copy simulation template and user's assets.
            await fs.copy(path.normalize(options.config.sim_dir), tmpdir, {filter: src => !src.includes('.git')});
            await fs.copy(
                path.normalize(user_data_dir),
                path.join(tmpdir, 'assets')
            );

            // Construct manifest.
            // FIXME: Survey URL!
            let survey = '/no-url-set.html';
            let scenes = scenario.vuex_state.scenes;
            let frames = scenario.vuex_state.frames;
            let frameList = scenario.vuex_state.frameList;
            let conditionLengths = scenario.vuex_state.conditionLengths;

            let actors = [];
            let images = [];
            let clips = [];

            let conditions = new Array(conditionLengths.length).fill(0).map(() => new Array());

            for (const frameID of frameList) {
                let frame = frames[frameID];
                for (var i = 0; i < frame.scenes.length; ++i) {
                    let scene = scenes[frame.scenes[i]].props;

                    switch (scene.type) {
                    case 'dialogue':
                        conditions[i].push(
                            {
                                'type': 'dialogue',
                                'name': scene.name,
                                'script': scene.script,
                                'actor': scene.actor,
                                'bg': scene.background,
                                'fg': scene.foreground
                            }
                        );
                        actors[scene.actor] = true;
                        images[scene.foreground] = true;
                        images[scene.background] = true;
                        break;
                    case 'buttons':
                        conditions[i].push(
                            {
                                'type': scene.type,
                                'name': scene.name,
                                'script': scene.script,
                                'actor': scene.actor,
                                'bg': scene.background,
                                'fg': scene.foreground,
                                'buttons': scene.buttons
                            }
                        );
                        actors[scene.actor] = true;
                        images[scene.foreground] = true;
                        images[scene.background] = true;
                        break;
                    case 'clip':
                        conditions[i].push(
                            {
                                'type':'dialogue',
                                'name': scene.name,
                                'clip': scene.clip
                            }
                        );
                        clips[scene.clip] = true;
                        break;
                    default:
                      //  throw Error(`Improper scene type: ${scene.id}.`);
                    }
                }
            }

            console.log(actors);
            console.log(images);
            console.log(clips);
            
            await fs.mkdirp(path.join(tmpdir, 'assets', 'clips'));
            await fs.mkdirp(path.join(tmpdir, 'assets', 'actors'));
            await fs.mkdirp(path.join(tmpdir, 'assets', 'foregrounds'));
            await fs.mkdirp(path.join(tmpdir, 'assets', 'backgrounds'));

            let fileList = Array.prototype.concat(
                (await fs.readdir(path.join(tmpdir, 'assets', 'clips'))).map(x => path.join('clips', x)),
                (await fs.readdir(path.join(tmpdir, 'assets', 'actors'))).map(x => path.join('actors', x)),
                (await fs.readdir(path.join(tmpdir, 'assets', 'foregrounds'))).map(x => path.join('foregrounds', x)),
                (await fs.readdir(path.join(tmpdir, 'assets', 'backgrounds'))).map(x => path.join('backgrounds', x))
            );
            
            console.log(fileList);

            let manifest = {
                'name': scenario.title,
                'description': scenario.description,
                // Simulation preload.js requires 'path' and 'manifest'.
                'path': 'assets/',
                // FIXME: Generate list of files.
                'manifest': fileList,
                // 'conditions' array used by simulation to render each in order.
                'conditions': conditions.map((scene_list, i) => ({
                    'name': `Experimental Condition ${i}/${conditions.length}`,
                    'scenes': scene_list
                })),
                // Actor and clip names needed by simulation to lookup filenames.
                'actors': actors,
                'clips': clips,
                'survey': survey
            };

            await fs.writeFile(path.join(tmpdir, 'manifest.json'), JSON.stringify(manifest));
            await fs.remove(path.join(os.tmpdir(), `sim-${id}.zip`));
            zip.zipSync(tmpdir, path.join(os.tmpdir(), `sim-${id}.zip`));
            await fs.remove(tmpdir);
            //res.send('okay');
            res.download(path.join(os.tmpdir(), `sim-${id}.zip`));

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
