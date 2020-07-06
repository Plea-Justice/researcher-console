/**
 * See index.js for routing to this point.
 * This route handles requests regarding user animation assets.
 */

module.exports = function (options) {
    var express = require('express');
    var router = express.Router();

    var fs = require('fs-extra');
    var path = require('path');
    var fileupload = require('express-fileupload');
    var sanitize = require('sanitize-filename');

    const atob = (src) => Buffer.from(src, 'base64').toString('binary');
    const btoa = (src) => Buffer.from(src, 'binary').toString('base64');

    const assetTypes = ['clips', 'actors', 'foregrounds', 'backgrounds'];
    
    // express-fileupload middleware to handle asset uploads.
    router.use(fileupload({
        limits: { fileSize: options.config.max_upload_mb * 1024 * 1024},
        safeFileNames: true,
        preserveExtension: true,
        abortOnLimit: true,
        limitHandler: (req, res, next)=>{
            res.status(413).json({
                success: false,
                message: `Uploaded file too large. Assets must be less than ${options.config.max_upload_mb}MiB.`,
                return: null
            });
            next();
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

            await fs.mkdirp(path.join(user_data_dir, 'clips'));
            await fs.mkdirp(path.join(user_data_dir, 'actors'));
            await fs.mkdirp(path.join(user_data_dir, 'foregrounds'));
            await fs.mkdirp(path.join(user_data_dir, 'backgrounds'));

            let clips = await fs.readdir(path.join(user_data_dir, 'clips'));
            let actors =  await fs.readdir(path.join(user_data_dir, 'actors'));
            let fgs =  await fs.readdir(path.join(user_data_dir, 'foregrounds'));
            let bgs =  await fs.readdir(path.join(user_data_dir, 'backgrounds'));
            
            clips = clips.map(name => `clips/${name}`);
            actors = actors.map(name => `actors/${name}`);
            fgs = fgs.map(name => `foregrounds/${name}`);
            bgs = bgs.map(name => `backgrounds/${name}`);

            clips.map(name => (assets[btoa(name)] = {'name': path.basename(name), 'type': 'clips'}));
            actors.map(name => (assets[btoa(name)] = {'name': path.basename(name), 'type': 'actors'}));
            fgs.map(name => (assets[btoa(name)] = {'name': path.basename(name), 'type': 'foregrounds'}));
            bgs.map(name => (assets[btoa(name)] = {'name': path.basename(name), 'type': 'backgrounds'}));

            let assetList = Array.prototype.concat(clips, actors, fgs, bgs).map(btoa);
            
            res.status(200).json({
                success: true,
                message: 'Asset listings returned.',
                return: {assetList, assets, assetTypes}
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'There was an error reading the user\'s assets.',
                return: err
            });
        }
    });

    /**
     * Upload a file.
     * @param upload FormData object.
     * @return Filename
     */
    router.post('/', (req, res) => {
        let user_data_dir = path.join(options.config.data_dir, req.session.user_id);

        if (!req.files || Object.keys(req.files).length === 0)
            res.status(400).json({
                success: false,
                message: 'No file was uploaded.',
                return: null
            });
        else if (!assetTypes.some((el) => el === req.body.type))
            res.status(400).json({
                success: false,
                message: `Asset type does not match one of ${assetTypes}.`,
                return: req.body.type
            });
        else if ((req.body.type === 'clips' || req.body.type === 'actors') && 
            path.extname(req.files.upload.name) !== '.js')
            res.status(400).json({
                success: false,
                message: 'Clips and assets must have a JavaScript file extension.',
                return: null
            });
        else if ((req.body.type === 'foregrounds' || req.body.type === 'backgrounds') && 
            (path.extname(req.files.upload.name) !== '.png' && path.extname(req.files.upload.name) !== '.jpg'))
            res.status(400).json({
                success: false,
                message: 'Foreground and background images must have a PNG or JPEG file extension.',
                return: null
            });
        else {
            let filepath = path.join(req.body.type, sanitize(req.files.upload.name).replace(/[\s,;]+/g, '_'));
            req.files.upload.mv(path.join(user_data_dir, filepath), (err)=>{
                if (err)
                    res.status(500).json({
                        success: false,
                        message: 'Error adding file to user data directory.',
                        return: err
                    });
                else res.status(200).json({
                    success: true,
                    message: 'Asset uploaded.',
                    return: btoa(filepath)
                });
            });
        }
    });

    /**
     * Delete a file. Asset ID is base64 encoded path.
     */
    router.delete('/:asset_id', async (req, res) => {
        let user_data_dir = path.join(options.config.data_dir, req.session.user_id);        
        let asset = path.parse(atob(req.params.asset_id));

        asset.dir = sanitize(asset.dir);
        asset.base = sanitize(asset.base);

        if (!assetTypes.some((el) => el === asset.dir)) 
            res.status(400).json({
                success: false,
                message: 'Illegal asset identifier.',
                return: null
            });
        else {
            try {
                await fs.unlink(path.join(user_data_dir, path.format(asset)));
                res.status(200).json({
                    success: true,
                    message: 'Asset deleted successfully.',
                    return: null
                });
            } catch (err) {
                res.status(500).json({
                    success: false,
                    message: 'The asset could not be deleted.',
                    return: null
                });
            }
        }
    });

    return router;
};