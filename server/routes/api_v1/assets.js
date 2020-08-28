/**
 * See index.js for routing to this point.
 * This route handles requests regarding user animation assets.
 */

const ScenarioModel = require('../../models/ScenarioModel');

module.exports = function (options) {
    const express = require('express');
    var router = express.Router();

    const util = require('../../common/util');
    const { publish }  = require('../../common/publish');
    const { fork } = require('child_process');

    const fs = require('fs-extra');
    const path = require('path');
    const os = require('os');
    const fileupload = require('express-fileupload');
    const sanitize = require('sanitize-filename');

    const atob = (src) => Buffer.from(src, 'base64').toString('binary');
    const btoa = (src) => Buffer.from(src, 'binary').toString('base64');

    const assetTypes = util.assetTypes;
    
    // express-fileupload middleware to handle asset uploads.
    router.use(fileupload({
        limits: { fileSize: options.config.max_upload_mb * 1024 * 1024},
        safeFileNames: true,
        preserveExtension: true,
        abortOnLimit: true,
        limitHandler: (req, res)=>{
            res.status(413).json(util.failure(
                `Uploaded file too large. Assets must be less than ${options.config.max_upload_mb}MiB.`,
            ));
        },
        createParentPath: true,
        useTempFiles: true,
        tempFileDir: os.tmpdir()
    }));

    /**
     * Get a listing of the user's data assets.
     * @return [File names.]
     */
    router.get('/', async (req, res) => {
        try {
            let assets = {};
            let user_data_dir = path.join(options.config.user_dir, req.session.user_id);

            await Promise.all(assetTypes.map(type => fs.mkdirp(path.join(user_data_dir, type))));

            let list = 
                await Promise.all(assetTypes.map(type => fs.readdir(path.join(user_data_dir, type))));

            assetTypes.forEach((type, i) => 
                list[i] = list[i]
                    .map(name => path.parse(`${type}/${name}`))
                    .map(p => ({...p, 'id': btoa(path.format(p))})));
            
            list = Array.prototype.concat(...list);
            list.forEach(p => assets[p.id] = {'id': p.id, 'name': p.name, 'type': p.dir, 'filename': p.base,
                'created': fs.statSync(path.join(user_data_dir, path.format(p))).mtimeMs});

            let assetList = list.map(p => p.id);

            res.status(200).json(util.success('Asset listings returned.', {assetList, assets, assetTypes}));
        } catch (err) {
            console.log(err);
            res.status(500).json(util.failure('There was an error reading the user\'s assets', err));
        }
    });

    /**
     * Upload a file.
     * @param upload FormData object.
     * @return Filename
     */
    router.post('/', async (req, res) => {
        let user_data_dir = util.userDir(options, req.session.user_id);

        if (options.config.noclobber) {
            res.status(400).json(util.failure('Warning: Resource deletion and overwrite disabled.'));
            return;
        }

        if (!req.files || Object.keys(req.files).length === 0)
            res.status(400).json(util.failure('No file was uploaded.'));
        else if (!assetTypes.some((el) => el === req.body.type))
            res.status(400).json(util.failure(
                `Asset type does not match one of ${assetTypes}.`,
                req.body.type
            ));
        else if (req.body.type.match(/clip|actor/) && 
            path.extname(req.files.file.name) !== '.js')
            res.status(400).json(util.failure('Clips and assets must have a JavaScript file extension.'));
        else if (req.body.type.match(/foreground|background|cache/) && 
            (!path.extname(req.files.file.name).match(/.*\.(png|bmp|jpg|jpeg)$/)))
            res.status(400).json(util.failure(
                'Foreground and background images must have a PNG or JPEG file extension.', 
                null
            ));
        else {
            /* FIXME: Renaming disabled until simulation compatible.
            let name = req.body.name.length > 0
                ? req.body.name + path.extname(req.files.file.name)
                : req.files.file.name;
            */
            let name = sanitize(req.files.file.name).replace(/[\s,;]+/g, '_');
            let id = btoa(path.join(req.body.type, name));
            let filepath = path.join(user_data_dir, req.body.type, name);

            if (fs.pathExistsSync(filepath)) {
                res.status(400).json(util.failure('An asset with the specified name already exists.'));
                return;
            }

            try {
                await req.files.file.mv(filepath);

                // Insert avatar customization variables into CreateJS assets.
                if (path.extname(filepath) === '.js')
                    publish(filepath);

                // Generate a thumbnail for the asset in the background.
                fork('common/thumbnail', [
                    path.resolve(filepath),
                    path.resolve(path.join(user_data_dir, 'thumbnails', `${id}.jpg`))
                ]);

                res.status(200).json(util.success('Asset uploaded.', id));
            } catch (err) {
                if (fs.pathExistsSync(filepath))
                    fs.removeSync(filepath);

                res.status(500).json(util.failure('Error uploading the asset. Delete the asset and try again.', err));
            }
        }
    });

    /**
     * Fetch an asset's thumbnail, if it exists.
     */
    router.get('/:asset_id/thumbnail', (req, res) => {
        let user_data_dir = path.join(options.config.user_dir, req.session.user_id);
        let thumbnail = path.resolve(path.join(user_data_dir, 'thumbnails', `${req.params.asset_id}.jpg`));
        if (fs.pathExistsSync(thumbnail))
            res.sendFile(thumbnail);
        else
            res.status(404).json(util.failure('The requested thumbnail image could not be found.'));
    });

    /**
     * Find references to an asset (for safe deletion).
     */
    router.get('/:asset_id/references', async (req, res) => {
        let matches = await ScenarioModel.find({
            user_id: req.session.user_id
        });
        
        let asset = path.parse(atob(req.params.asset_id));
        let type = asset.dir;
        
        matches = matches.filter(scenario => 
            Object.entries((scenario.scenes)).map(([id, scene])=> 
                scene.props ?
                    [scene.props.actor, scene.props.clip, 
                        scene.props.foreground, scene.props.background].includes(asset.name) : false
            ).some(y=>y)
        );
        
        matches = matches.map(x=>({
            id: x._id,
            name: x.name,
            description: x.description,
            survey: x.survey,
            created: x.created,
            modified: x.modified
        }));

        res.json(util.success('Returned scenarios that reference the asset.', matches ));
    });    

    /**
     * Delete a file. Asset ID is base64 encoded path.
     */
    router.delete('/:asset_id', async (req, res) => {
        let user_data_dir = path.join(options.config.user_dir, req.session.user_id);        
        let asset = path.parse(atob(req.params.asset_id));
        let thumbnail = path.join(user_data_dir, 'thumbnails', `${req.params.asset_id}.jpg`);

        if (options.config.noclobber) {
            res.status(400).json(util.failure('Warning: Resource deletion and overwrite disabled.'));
            return;
        }

        asset.dir = sanitize(asset.dir);
        asset.base = sanitize(asset.base);

        if (!assetTypes.some((el) => el === asset.dir)) 
            res.status(400).json(util.failure('Illegal asset identifier.'));
        else {
            try {
                await fs.unlink(path.join(user_data_dir, path.format(asset)));
                if (fs.pathExistsSync(thumbnail))
                    await fs.unlink(thumbnail);
                res.status(200).json(util.success('Asset deleted successfully.'));
            } catch (err) {
                res.status(500).json(util.failure('The asset could not be deleted.'));
            }
        }
    });

    return router;
};