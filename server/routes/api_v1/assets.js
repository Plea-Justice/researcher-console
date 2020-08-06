/**
 * See index.js for routing to this point.
 * This route handles requests regarding user animation assets.
 */

module.exports = function (options) {
    const express = require('express');
    var router = express.Router();

    const util = require('../../common/util');
    const { fork } = require('child_process');

    const fs = require('fs-extra');
    const path = require('path');
    const fileupload = require('express-fileupload');
    const sanitize = require('sanitize-filename');

    const atob = (src) => Buffer.from(src, 'base64').toString('binary');
    const btoa = (src) => Buffer.from(src, 'binary').toString('base64');

    const assetTypes = ['clips', 'actors', 'foregrounds', 'backgrounds'];
    
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
        // useTempFiles: true,
        // tempFileDir: '/tmp'
    }));

    /**
     * Get a listing of the user's data assets.
     * @return [File names.]
     */
    router.get('/', async (req, res) => {
        try {
            let assets = {};
            let user_data_dir = path.join(options.config.data_dir, req.session.user_id);

            await Promise.all(assetTypes.map(type => fs.mkdirp(path.join(user_data_dir, type))));

            let list = 
                await Promise.all(assetTypes.map(type => fs.readdir(path.join(user_data_dir, type))));

            assetTypes.forEach((type, i) => 
                list[i] = list[i]
                    .map(name => path.parse(`${type}/${name}`))
                    .map(p => ({...p, 'id': btoa(path.format(p))})));
            
            list = Array.prototype.concat(...list);
            list.forEach(p => assets[p.id] = {'id': p.id, 'name': p.name, 'type': p.dir, 
                'created': util.posixTimeToHoursAgo(fs.statSync(path.join(user_data_dir, path.format(p))).mtimeMs)});

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
    router.post('/', (req, res) => {
        let user_data_dir = path.join(options.config.data_dir, req.session.user_id);

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
        else if ((req.body.type === 'clips' || req.body.type === 'actors') && 
            path.extname(req.files.file.name) !== '.js')
            res.status(400).json(util.failure('Clips and assets must have a JavaScript file extension.'));
        else if ((req.body.type === 'foregrounds' || req.body.type === 'backgrounds') && 
            (path.extname(req.files.file.name) !== '.png' && path.extname(req.files.file.name) !== '.jpg'))
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
            let name = req.files.file.name;
 
            let filepath = path.join(req.body.type, sanitize(name).replace(/[\s,;]+/g, '_'));
            if (fs.pathExistsSync(path.join(user_data_dir, filepath))) {
                res.status(400).json(util.failure('An asset with the specified name already exists.'));
                return;
            }
            req.files.file.mv(path.join(user_data_dir, filepath), (err)=>{
                if (err)
                    res.status(500).json(util.failure('Error adding file to user data directory.', err));
                else res.status(200).json(util.success('Asset uploaded.', btoa(filepath)));
            });

            // Generate a thumbnail for the asset in the background.
            fork('common/thumbnail', [
                path.resolve(path.join(user_data_dir, filepath)),
                path.resolve(path.join(user_data_dir, 'thumbnails', `${btoa(filepath)}.jpg`))
            ]);
        }
    });

    /**
     * Fetch an asset's thumbnail, if it exists.
     */
    router.get('/:asset_id/thumbnail', (req, res) => {
        let user_data_dir = path.join(options.config.data_dir, req.session.user_id);
        let thumbnail = path.resolve(path.join(user_data_dir, 'thumbnails', `${req.params.asset_id}.jpg`));
        if (fs.pathExistsSync(thumbnail))
            res.sendFile(thumbnail);
        else
            res.status(404).json(util.failure('The requested thumbnail image could not be found.'));
    });

    /**
     * Delete a file. Asset ID is base64 encoded path.
     */
    router.delete('/:asset_id', async (req, res) => {
        let user_data_dir = path.join(options.config.data_dir, req.session.user_id);        
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